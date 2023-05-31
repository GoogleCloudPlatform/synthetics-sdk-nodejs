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

import { Request, Response } from 'express';
import {
  SyntheticResult,
  GenericResultV1,
  GenericResultV1_GenericError,
} from './index';
import ErrorStackParser from 'error-stack-parser';
import {
  getRuntimeMetadata,
  instantiateMetadata,
} from './runtime_metadata_extractor';

instantiateMetadata();

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const runSynthetic = async (syntheticCode: () => any) => {
  const startTime = new Date().toISOString();

  const syntheticResult = SyntheticResult.create();
  const synthetic_generic_result = GenericResultV1.create();

  try {
    await syntheticCode();
    synthetic_generic_result.ok = true;
  } catch (err: unknown) {
    synthetic_generic_result.ok = false;

    if (err instanceof Error) {
      const stack = ErrorStackParser.parse(err);
      const firstUserErrorStackFrame = stack.find(
        (frame) => (frame.fileName ?? '').charAt(0) === '/'
      );
      synthetic_generic_result.generic_error =
        GenericResultV1_GenericError.create({
          error_type: err.name,
          error_message: err.message,
          file_path: firstUserErrorStackFrame?.fileName,
          line: firstUserErrorStackFrame?.lineNumber,
          function_name: firstUserErrorStackFrame?.functionName,
        });
    }
  }

  const endTime = new Date().toISOString();

  syntheticResult.synthetic_generic_result_v1 = synthetic_generic_result;
  syntheticResult.start_time = startTime;
  syntheticResult.end_time = endTime;
  syntheticResult.runtime_metadata = getRuntimeMetadata();

  return syntheticResult;
};

/**
 * Middleware for ease of running user written code in the context of GCM
 * Synthetics. When a user written function is provided, it is ran and 
 * the following scnearios occur:
 * 
 * * If the function exits without error, a GenericResponse is served as a 
 *   response, with the `ok` attribute being set to true.
 * * If the function throws an Error, a GenericResponse is served as a
 *   response, with the `ok` attribute being set to false, and attributes of
 *   the error being provided.
 * 
 * This function should be used within a Google Cloud Function http function,
 * or an express js compatible handler.
 * 
 * @public
 * @param syntheticCode - A function that is ran prior to a response being
 *                        served by the returned middleware
 * 
 * @returns ExpressJS compatible middleware that invokes SyntheticsSDK mocha, and
 * returns the results via res.send
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function runSyntheticHandler(syntheticCode: () => any) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return async (req: Request, res: Response): Promise<any> =>
    res.send(await runSynthetic(syntheticCode));
}
