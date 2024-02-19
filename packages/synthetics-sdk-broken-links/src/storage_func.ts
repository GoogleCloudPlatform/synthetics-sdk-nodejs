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
 * Attempts to get an existing storage bucket or creates a new one.
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
  // if storage client was not properly initialized or storage no selected
  if (!storageClient) return null;

  // No storage_location given, create one
  if (storageLocation.length === 0) {
    const projectId = await resolveProjectId();
    const region = await getExecutionRegion();
    const bucketName = `gcm-${projectId}-synthetics-${region}}`;

    try {
      const bucket = storageClient.bucket(bucketName);
      const [bucketExists] = await bucket.exists();

      if (bucketExists) {
        return bucket;
      } else {
        // Bucket doesn't exist, let's create it
        const [newBucket] = await bucket.create({
          location: region, // Set bucket location
          storageClass: 'STANDARD', // Standard storage class
        });
        return newBucket;
      }
    } catch (err) {
      if (err instanceof Error) process.stderr.write(err.message);
      errors.push({
        error_type: 'BucketCreationError',
        error_message: `Failed to create bucket ${bucketName}. Please reference server logs for further information.`,
      });
      return null;
    }
  } else {
    // User provided storage location
    const bucketName = storageLocation.split('/')[0]; // Only first part needed for validation
    try {
      const bucket = storageClient.bucket(bucketName);
      const [bucketExists] = await bucket.exists();

      if (bucketExists) {
        // Valid bucket
        return bucket;
      } else {
        // Invalid bucket
        errors.push({
          error_type: 'InvalidStorageLocation',
          error_message: `Invalid storage_location: Bucket ${bucketName} does not exist.`,
        });
        return null;
      }
    } catch (err) {
      // Catch other (non-404) errors
      if (err instanceof Error) process.stderr.write(err.message);
      errors.push({
        error_type: 'StorageValidationError',
        error_message: `Error validating storage location: ${bucketName}. Please reference server logs for further information.`,
      });
      return null;
    }
  }
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
