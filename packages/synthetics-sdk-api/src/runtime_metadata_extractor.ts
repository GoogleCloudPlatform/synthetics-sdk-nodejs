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

let runtime_metadata: { [key: string]: string } = {};
const list_of_env_variables = ['K_SERVICE', 'K_REVISION', 'K_CONFIGURATION'];

const synthetics_sdk_api_package = require('../package.json');

/**
 * @public
 *
 * This function repopulates the global runtime_metadata object.
 * NOTE: This should only be called once per package, or when
 * testing this module.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instantiateMetadata(sub_sdk_package?: any) {
  runtime_metadata = {};

  list_of_env_variables.forEach((env_variable) => {
    const env_variable_value = process.env[env_variable];
    if (env_variable_value) {
      runtime_metadata[env_variable] = env_variable_value;
    }
  });

  runtime_metadata[synthetics_sdk_api_package.name] =
    synthetics_sdk_api_package.version;
  if (sub_sdk_package) {
    runtime_metadata[sub_sdk_package?.name ?? 'unknown_name'] =
      sub_sdk_package?.version ?? 'unknown';
  }
}

/**
 * Retrieves all runtime metadata relevant to GCM Synthetics and Cloud
 * Monitoring
 *
 * @returns Runtime metadata relevant to Cloud Monitoring
 */
export function getRuntimeMetadata() {
  return runtime_metadata;
}
