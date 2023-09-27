// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START monitoring_synthetic_monitoring_custom_typescript_script]
import {runSyntheticHandler, instantiateAutoInstrumentation} from '@google-cloud/synthetics-sdk-api'
// Run instantiateAutoInstrumentation before any other code runs, to get automatic logs and traces
instantiateAutoInstrumentation();
import * as ff from '@google-cloud/functions-framework';
import axios from 'axios';
import assert from 'node:assert';
import {Logger} from 'winston';

ff.http('SyntheticFunction', runSyntheticHandler(async ({logger}: {logger: Logger}) => {
  /*
   * This function executes the synthetic code for testing purposes.
   * If the code runs without errors, the synthetic test is considered successful.
   * If an error is thrown during execution, the synthetic test is considered failed.
   */
  logger.info('Making an http request using synthetics');
  const url = 'https://www.google.com/'; // URL to send the request to
  return await assert.doesNotReject(axios.get(url));
}));

// [END monitoring_synthetic_monitoring_custom_typescript_script]
