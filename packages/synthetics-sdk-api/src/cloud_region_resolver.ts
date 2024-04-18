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

import axios, { AxiosResponse } from 'axios';

/**
 *
 * @public
 *
 * Retrieves the region in which the current Google Cloud Function (v2) is
 * executing by querying the metadata server.
 */
export async function getExecutionRegion(): Promise<string | null> {
  const metadataServerUrl =
    'http://metadata.google.internal/computeMetadata/v1/instance/region';
  const headers = { 'Metadata-Flavor': 'Google' };

  try {
    const response: AxiosResponse = await axios.get(metadataServerUrl, {
      headers,
    });

    // Extract region from the response (e.g., 'us-east1')
    const regions = response.data.split('/');
    const region = regions[regions.length - 1];

    return region;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching region from metadata server:', error);
    } else {
      console.error('Unexpected error:', error);
    }
  }

  return null;
}
