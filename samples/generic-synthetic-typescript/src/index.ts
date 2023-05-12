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

import * as ff from '@google-cloud/functions-framework';
import fetch from 'node-fetch';
import {SyntheticResult, GenericResultV1, GenericResultV1_GenericError} from '@google-cloud/synthetics-sdk-api'

/*
 * This is the function that should run your code synthetic code. This should
 * either exit without issue, in which case the synthetic is considered a
 * success, or it should throw an Error, in which case the synthetic is
 * considered a failure.
 */
const syntheticCode = async () => {
  // PUT YOUR SYNTHETIC CODE IN THIS FUNCTION
  const url = 'https://www.google.com/'; // URL to send the request to
  return await fetch(url);
}

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions. It is unlikely that you should need to change the
 * contents of this function.
 */
ff.http('SyntheticFunction', async (req: ff.Request, res: ff.Response) => {
  const startTime = new Date().toISOString();

  const syntheticResult = SyntheticResult.create();
  let synthetic_generic_result = GenericResultV1.create();

  try {
    await syntheticCode();
    synthetic_generic_result.ok = true;
  } catch (err: unknown) {
    synthetic_generic_result.ok = false;

    if (err instanceof Error) {

      synthetic_generic_result.generic_error = GenericResultV1_GenericError.create({
        error_type: err.name,
        error_message: err.message
      });
    }
  }

  const endTime = new Date().toISOString();

  syntheticResult.synthetic_generic_result_v1 = synthetic_generic_result;
  syntheticResult.start_time = startTime;
  syntheticResult.end_time = endTime;

  res.send(syntheticResult);
});