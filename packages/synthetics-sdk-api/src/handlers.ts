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
import { Logger } from 'winston';

import { getInstrumentedLogger } from './auto_instrumentation';
instantiateMetadata();

const asyncFilenamePrefix = 'async ';
const runSynthetic = async (
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  syntheticCode: (args: { logger: Logger, syntheticExecutionId: string  }) => any
) => {
  const logger = await getInstrumentedLogger();
  const startTime = new Date().toISOString();

  const syntheticResult = SyntheticResult.create();
  const synthetic_generic_result = GenericResultV1.create();

  try {
    await syntheticCode({ logger });
    synthetic_generic_result.ok = true;
  } catch (err: unknown) {
    synthetic_generic_result.ok = false;

    if (err instanceof Error) {
      const firstFrame = firstUserErrorStackFrame(ErrorStackParser.parse(err));

      synthetic_generic_result.generic_error =
        GenericResultV1_GenericError.create({
          error_type: err.name,
          error_message: err.message,
          file_path: firstFrame?.fileName,
          line: firstFrame?.lineNumber,
          function_name: firstFrame?.functionName,
        });

      synthetic_generic_result.generic_error.stack_trace = err.stack ?? '';
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
export function runSyntheticHandler(
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  syntheticCode: (args: { logger: Logger, syntheticExecutionId: string }) => any
) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return async (req: Request, res: Response): Promise<any> =>
    res.send(await runSynthetic(syntheticCode));
}

export function firstUserErrorStackFrame(
  stack: ErrorStackParser.StackFrame[]
): ErrorStackParser.StackFrame | undefined {
  return stack
    .map((frame) => {
      const filenameWithoutPrefix =
        (frame.fileName ?? '').substring(0, 6) === asyncFilenamePrefix
          ? (frame.fileName ?? '').substring(6)
          : frame.fileName;

      frame.fileName = filenameWithoutPrefix;
      return frame;
    })
    .find((frame) => (frame.fileName ?? '').charAt(0) === '/');
}
