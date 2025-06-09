// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Standard Libraries
import * as path from 'path';

// Internal Project Files
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_CaptureCondition as ApiCaptureCondition,
  BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput as ApiScreenshotOutput,
  getExecutionRegion,
  resolveProjectId,
} from '@google-cloud/synthetics-sdk-api';
import { getStoragePathToExecution, sanitizeObjectName } from './link_utils';

// External Dependencies
import { Storage, Bucket } from '@google-cloud/storage';
import { Page } from 'puppeteer';

export interface StorageParameters {
  storageClient: Storage | null;
  bucket: Bucket | null;
  checkId: string;
  executionId: string;
  screenshotNumber: number;
}

/**
 * Attempts to get an existing storage bucket if provided by the user OR
 * create/use a dedicated synthetics bucket.
 * Handles various errors gracefully, providing structured details in the `errors` array.
 *
 * @param storageClient - An initialized Storage client from the
 *          '@google-cloud/storage' SDK.
 * @param storageLocation - The desired storage location (bucket or folder)
 *          provided by the user. Can be empty.
 * @param errors - An array to accumulate potential errors of type `BaseError`.
 * @returns A 'Bucket' object if successful, or null if errors occurred.
 */
export async function getOrCreateStorageBucket(
  storageClient: Storage | null,
  storageLocation: string,
  errors: BaseError[]
): Promise<Bucket | null> {
  let bucketName = '';

  try {
    if (!storageClient) return null;

    const projectId = sanitizeObjectName(await resolveProjectId());
    const region = sanitizeObjectName(await getExecutionRegion());

    // if the user chose to use/create the default bucket but we were not able
    // to resolve projectId or cloudRegion
    if (!storageLocation && (!projectId || !region)) return null;

    bucketName = storageLocation
      ? storageLocation.split('/')[0]
      : `gcm-${projectId}-synthetics-${region}`;

    const bucket = storageClient.bucket(bucketName);
    const [bucketExists] = await bucket.exists();

    if (bucketExists) {
      return bucket; // Bucket exists, return it
    } else if (!storageLocation) {
      // Create only if no location was provided
      const [newBucket] = await bucket.create({
        location: region,
        storageClass: 'STANDARD',
      });
      return newBucket;
    } else {
      // User-provided invalid location
      errors.push({
        error_type: 'InvalidStorageLocation',
        error_message: `Invalid storage_location: Bucket ${bucketName} does not exist.`,
      });
    }
  } catch (err) {
    const errorType = storageLocation
      ? 'StorageValidationError'
      : 'BucketCreationError';

    // Using console.error rather than stderr.write since err type is unknown
    console.error(errorType, err);

    errors.push({
      // General error handling
      error_type: errorType,
      error_message: `Failed to ${
        storageLocation ? 'validate' : 'create'
      } bucket ${bucketName}. Please reference server logs for further information.`,
    });
  }

  return null; // Return null if bucket retrieval or creation failed
}

/**
 * Initializes a Google Cloud Storage client, if storage is selected. Handles
 * both expected and unexpected errors during initialization.
 *
 * @param errors - An array to accumulate potential errors of type `BaseError`.
 * @returns A Storage client object if successful, or null if errors occurred.
 */
export function createStorageClientIfStorageSelected(
  errors: BaseError[],
  captureCondition: ApiCaptureCondition
): Storage | null {
  if (captureCondition === ApiCaptureCondition.NONE) return null;

  try {
    return new Storage();
  } catch (err) {
    console.error('StorageClientInitializationError', err);

    errors.push({
      error_type: 'StorageClientInitializationError',
      error_message:
        'Failed to initialize Storage client. Please reference server logs for further information.',
    });
    return null;
  }
}

/**
 * Uploads a screenshot to Google Cloud Storage.
 *
 * @param screenshot - Base64-encoded screenshot data.
 * @param filename - Desired filename for the screenshot.
 * @param storageParams - An object containing storageClient and bucket.
 * @param options - Broken links checker options.
 * @returns An ApiScreenshotOutput object indicating success or a screenshot_error.
 */
export async function uploadScreenshotToGCS(
  page: Page,
  storageParams: StorageParameters,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<ApiScreenshotOutput> {
  const screenshot_output: ApiScreenshotOutput = {
    screenshot_file: '',
    screenshot_error: {} as BaseError,
  };
  try {
    // Early exit if storage is not properly configured
    if (!storageParams.storageClient || !storageParams.bucket) {
      return screenshot_output;
    }

    const screenshot: Uint8Array = await page.screenshot({
      fullPage: true,
    });
    const screenshot_buffer = Buffer.from(screenshot);
    const filename = 'screenshot_' + storageParams.screenshotNumber + '.png';

    const writeDestination = path.join(
      getStoragePathToExecution(storageParams, options),
      filename
    );

    // Upload to GCS
    await storageParams.bucket.file(writeDestination).save(screenshot_buffer, {
      contentType: 'image/png',
    });

    storageParams.screenshotNumber += 1;
    screenshot_output.screenshot_file = filename;
  } catch (err) {
    console.error('ScreenshotFileUploadError', err);

    screenshot_output.screenshot_error = {
      error_type: 'ScreenshotFileUploadError',
      error_message: `Failed to take and/or upload screenshot for ${await page.url()}. Please reference server logs for further information.`,
    };
  }

  return screenshot_output;
}
