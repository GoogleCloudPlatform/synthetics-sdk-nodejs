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

import { spawn } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';

import {
  GenericResultV1,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import { getRuntimeMetadata } from './runtime_metadata_extractor';

export interface SyntheticMochaOptions {
  /**
   * One or more files, directories, or globs to test, in a format typically provided to the mocha cli.
   * These specs should be relative to the root of the application that is running the Synthetics SDK.
   * @example: `${__dirname}/mocha_tests.spec.js`
   */
  spec: string;

  /**
   * One or more arguments as they would otherwise be provided to the mocha cli.
   * @example: "--file ${__dirname}/preload.js --forbid-pending"
   */
  mochaOptions?: string;
}

const defaultError: GenericResultV1 = {
  ok: false,
  generic_error: {
    error_type: 'Error',
    error_message:
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.',
    function_name: '',
    file_path: '',
    line: 0,
  },
};

const getGenericSyntheticResult = (startTime: string): SyntheticResult => ({
  synthetic_generic_result_v1: defaultError,
  runtime_metadata: getRuntimeMetadata(),
  start_time: startTime,
  end_time: new Date().toISOString(),
});

/**
 * Runs a mocha spec in a child process, returning a json object that complies
 * with the response body required by GCM Synthetics' API contract.
 * When cloud monitoring receives data from this function, it will convert
 * it to metrics, logs, and traces.
 *
 * @public
 * @param options - Options for running the mocha suite
 * @returns Results of the mocha test run, complying with the Synthetics SDK API.
 *          Errors within this function reolve, with further information within the
 *          returned object's synthetic_generic_result_v1.
 */
export function mocha(
  options: SyntheticMochaOptions
): Promise<SyntheticResult> {
  const uniqueFileName = `/tmp/${crypto.randomUUID()}`;
  const runtimeMetadata = getRuntimeMetadata();
  const genericStartTime = new Date().toISOString();

  return new Promise((resolve) => {
    if (!options.spec) {
      process.stderr.write('No test spec was provided');

      resolve(getGenericSyntheticResult(genericStartTime));
    }

    const childProcess = spawn(
      `mocha ${options.spec} ${options.mochaOptions ?? ''} ` +
        `--reporter ${__dirname}/gcm_synthetics_mocha_reporter.js ` +
        `--reporter-options output=${uniqueFileName}`,
      {
        shell: true,
        stdio: 'inherit',
      }
    );
    childProcess.on('exit', () => {
      try {
        const output = fs.readFileSync(uniqueFileName, { encoding: 'utf-8' });
        const syntheticResult: SyntheticResult = SyntheticResult.fromJSON(
          JSON.parse(output)
        );

        syntheticResult.runtime_metadata = runtimeMetadata;
        resolve(syntheticResult);
        fs.unlinkSync(uniqueFileName);
      } catch (err: unknown) {
        if (err instanceof Error) {
          process.stderr.write(err.message);
        }

        resolve(getGenericSyntheticResult(genericStartTime));
      }
    });
  });
}
