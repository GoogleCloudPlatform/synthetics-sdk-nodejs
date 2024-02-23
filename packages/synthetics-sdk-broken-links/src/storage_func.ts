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

import { Storage, Bucket } from '@google-cloud/storage';
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition,
  resolveProjectId,
  getExecutionRegion,
} from '@google-cloud/synthetics-sdk-api';

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
    const projectId = await resolveProjectId();
    const region = await getExecutionRegion();

    // if storageClient was not properly initialized OR the user chose to
    // use/create the default bucket but we were not able to resolve projectId
    // or cloudRegion
    if (!storageClient || (!storageLocation && (!projectId || !region)))
      return null;

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
    if (err instanceof Error) process.stderr.write(err.message);
    errors.push({
      // General error handling
      error_type: storageLocation
        ? 'StorageValidationError'
        : 'BucketCreationError',
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
  storage_condition: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition
): Storage | null {
  if (
    storage_condition ===
    BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition.NONE
  )
    return null;

  try {
    return new Storage();
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
    errors.push({
      error_type: 'StorageClientInitializationError',
      error_message:
        'Failed to initialize Storage client. Please reference server logs for further information.',
    });
    return null;
  }
}
