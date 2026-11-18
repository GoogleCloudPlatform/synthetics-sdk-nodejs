// Copyright 2026 Google LLC
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

import * as http from 'http';

const DEFAULT_METADATA_HOST = 'metadata.google.internal';
const NUMERIC_PROJECT_ID_PATH =
  '/computeMetadata/v1/project/numeric-project-id';
const METADATA_TIMEOUT_MILLIS = 3000;

/**
 * Retrieves the numeric project ID (project number) in which the current
 * Google Cloud Function (v2) / Cloud Run service is executing by querying
 * the Compute Metadata Server.
 *
 * @returns The numeric project number as a string, or null if unavailable.
 */
export function resolveProjectNumber(): Promise<string | null> {
  const rawHost = (
    process.env.GCE_METADATA_HOST || DEFAULT_METADATA_HOST
  ).replace(/^https?:\/\//, '');
  const url = `http://${rawHost}${NUMERIC_PROJECT_ID_PATH}`;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: string | null) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    try {
      const req = http.get(
        url,
        {
          headers: { 'Metadata-Flavor': 'Google' },
          timeout: METADATA_TIMEOUT_MILLIS,
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            console.error(
              `Error fetching project number from metadata server: status ${res.statusCode}`
            );
            finish(null);
            return;
          }

          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => {
            body += chunk;
          });
          res.on('end', () => {
            const trimmed = body.trim();
            if (/^\d+$/.test(trimmed)) {
              finish(trimmed);
            } else {
              console.error(
                'Unexpected project number format from metadata server'
              );
              finish(null);
            }
          });
          res.on('error', (err) => {
            console.error(
              'Error reading project number from metadata server:',
              err
            );
            finish(null);
          });
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error('Metadata server request timed out'));
      });

      req.on('error', (err) => {
        console.error(
          'Error fetching project number from metadata server:',
          err
        );
        finish(null);
      });
    } catch (err) {
      console.error('Unexpected error fetching project number:', err);
      finish(null);
    }
  });
}
