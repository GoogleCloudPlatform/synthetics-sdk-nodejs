// Copyright 2022 Google LLC
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

import * as fs from 'fs';
import * as Mocha from 'mocha';
import * as path from 'path';

import {
  MochaResultV1,
  MochaSuiteResult,
  MochaTestResult,
  MochaTestResult_TestError_StackFrame,
} from 'synthetics-sdk-api';

const {
  EVENT_RUN_BEGIN,
  EVENT_SUITE_BEGIN,
  EVENT_TEST_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_PENDING,
  EVENT_RUN_END,
} = Mocha.Runner.constants;

interface GcmSyntheticsReporterOptions {
  reporterOption: { output: string | null };
}

class GcmSyntheticsReporter {
  /**
   * Constructs a new `GcmSyntheticsReporter` reporter instance.
   *
   * @public
   * @class GcmSyntheticsReporter
   * @memberof Mocha.reporters
   * @param {!Runner} runner - Instance triggers reporter actions.
   * @param {?GcmSyntheticsReporterOptions=} options - runner options
   * @param {?string=} options.reporterOption.output - If not provided, output
   *                   is logged to stdout. If provided, file location where
   *                   output is written.
   */
  constructor(runner: Mocha.Runner, options: GcmSyntheticsReporterOptions) {
    const output = options?.reporterOption?.output;

    const suiteResults: MochaSuiteResult = {
      suite_count: 0,
      test_count: 0,
      passing_test_count: 0,
      pending_test_count: 0,
      failing_test_count: 0,
      suite_start_time: '',
      suite_end_time: '',
    };
    const testResults: MochaTestResult[] = [];

    runner
      .on(EVENT_RUN_BEGIN, () => {
        suiteResults.suite_start_time = new Date().toISOString();
      })
      .on(EVENT_SUITE_BEGIN, (suite: Mocha.Suite) => {
        // Only add root suite when it has tests directly in it.
        if (!suite.root || suite.tests.length > 0) {
          suiteResults.suite_count = (suiteResults.suite_count ?? 0) + 1;
        }
      })
      .on(EVENT_TEST_BEGIN, () => {
        suiteResults.test_count = (suiteResults.test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_PASS, (test: Mocha.Test) => {
        testResults.push(serializeTest(test, undefined));
        suiteResults.passing_test_count =
          (suiteResults.passing_test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_FAIL, (test: Mocha.Test, err: Error) => {
        testResults.push(serializeTest(test, err));
        suiteResults.failing_test_count =
          (suiteResults.failing_test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_PENDING, () => {
        suiteResults.pending_test_count =
          (suiteResults.pending_test_count ?? 0) + 1;
      })
      .on(EVENT_RUN_END, () => {
        suiteResults.suite_end_time = new Date().toISOString();
        const mochaResult: MochaResultV1 = {
          suite_result: suiteResults,
          test_results: testResults,
        };
        const json = JSON.stringify(MochaResultV1.toJSON(mochaResult), null, 2);
        if (output) {
          try {
            fs.mkdirSync(path.dirname(output), { recursive: true });
            fs.writeFileSync(output, json);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            process.stderr.write(
              `[mocha] writing output to '${output}' failed: ${message}\n`
            );
            process.stdout.write(`${json}\n`);
          }
        } else {
          process.stdout.write(`${json}\n`);
        }
      });
  }
}

/**
 * Serializes test results to relevant results for uptime to process.
 * @param {!Test} test - Test that was ran by mocha, pass & duration stats
 *                       being relevant.
 * @param {?ErrnoException} err - Error thrown when a test fails.
 * @return {!MochaTestResult} Serialized results relevant for reporting by
 *                            Cloud Monitoring.
 */
export function serializeTest(
  test: Mocha.Test,
  err: NodeJS.ErrnoException | undefined
): MochaTestResult {
  const now = Date.now();
  return {
    // Relevant for uptime metrics
    test_passed: !err,
    test_start_time: new Date(now - (test.duration ?? 0)).toISOString(),
    test_end_time: new Date(now).toISOString(),
    // metadata for logging
    title: test.title,
    title_paths: test.titlePath(),
    error: err
      ? {
          name: err.name,
          message: err.message,
          stack_frames: serializeStack(err.stack || ''),
        }
      : undefined,
  };
}

/**
 * Serializes a NodeJs error stack into a collection of consumable objects.
 * @param {string} errStack The stack property on a NodeJs Error.
 * @return {!array} Serialized error stack frames which include properties
 *                  functionName, fileName, lineNumber, columnNumber.
 */
function serializeStack(
  errStack: string
): MochaTestResult_TestError_StackFrame[] {
  if (!errStack) {
    return [];
  }

  const stack = errStack.split('\n');
  // removes first line with redundant error message, already
  // captured in err.message
  stack.shift();

  return stack.map((frameStr: string) => {
    const frame = frameStr.split('at ')[1];
    if (!frame) {
      // Frame is in an invalid format, this is defensive.
      return {};
    }
    const locationParansRegex = /\(([^)]+)\)/;
    const locationInParens = locationParansRegex.exec(frame);

    if (locationInParens) {
      // if regex passed, location will be found at
      // [1] index. If so, then there is a function
      // name prefix
      return {
        function_name: frame.split(locationInParens[0])[0].trim(),
        ...serializeLocation(locationInParens[1]),
      };
    }
    return { function_name: undefined, ...serializeLocation(frame) };
  });
}

/**
 * Serializes the location of an error which takes one of the following forms:
 * * native, if the frame represents a call internal to V8 (as in [].forEach).
 * * plain-filename.js:line:column, if the frame represents a call internal to
 *   Node.js.
 * * /absolute/path/to/file.js:line:column, if the frame represents a call in
 * a user program (using CommonJS module system), or its dependencies.
 * * <transport-protocol>:///url/to/module/file.mjs:line:column, if the frame
 *   represents a call in a user program (using ES module system), or its
 *   dependencies.
 * @param {string} location String location at which an error occurred.
 * @return {!Object} serializedLocation the serialized location that includes
 *                   fileName, lineNumber, and columnNumber.
 */
function serializeLocation(location: string) {
  const locationColonSplit = location.split(':'); // last two entries are line, col. There may be
  // ":" in other places in string.
  if (locationColonSplit.length < 3) {
    return { file_name: location };
  }

  const columnNumber = locationColonSplit.pop();
  const lineNumber = locationColonSplit.pop();

  return {
    file_name: locationColonSplit.join(':'),
    line: Number(lineNumber),
    column: Number(columnNumber),
  };
}

module.exports = GcmSyntheticsReporter;
