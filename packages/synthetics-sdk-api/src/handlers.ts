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
import { serializeStack } from './stack_serializer';
import { getRuntimeMetadata } from './runtime_metadata_extractor';

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
      const stack = serializeStack(err.stack ?? '');

      synthetic_generic_result.generic_error =
        GenericResultV1_GenericError.create({
          error_type: err.name,
          error_message: err.message,
          file_path: stack[0]?.file_path,
          line: stack[0]?.line,
          function_name: stack[0]?.function_name,
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
 * Middleware for easy invocation of SyntheticSDK mocha, and may be used to
 * register a GoogleCloudFunction http function, or express js compatible handler.
 * @public
 * @param options - Options for running GCM Synthetics Mocha.
 * @returns ExpressJS compatible middleware that invokes SyntheticsSDK mocha, and
 * returns the results via res.send
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function runSyntheticHandler(syntheticCode: () => any) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return async (req: Request, res: Response): Promise<any> =>
    res.send(await runSynthetic(syntheticCode));
}
