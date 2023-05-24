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

import * as fs from 'fs';
import * as Mocha from 'mocha';
import * as path from 'path';

import {
  TestFrameworkResultV1,
  TestResult,
  SyntheticResult,
  serializeStack,
} from '@google-cloud/synthetics-sdk-api';

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
  /**
   * If provided, file location where output is written. If not provided,
   * output is logged to stdout.
   */
  reporterOption: { output: string | null };
}

class GcmSyntheticsReporter {
  /**
   * Constructs a new `GcmSyntheticsReporter` reporter instance.
   *
   * @public
   * @class GcmSyntheticsReporter
   * @memberof Mocha.reporters
   * @param runner - Mocha runner that triggers reporter actions.
   * @param GcmSyntheticsReporterOptions - Options for the reporter
   */
  constructor(runner: Mocha.Runner, options: GcmSyntheticsReporterOptions) {
    const output = options?.reporterOption?.output;

    const testFrameworkResult: TestFrameworkResultV1 = {
      suite_count: 0,
      test_count: 0,
      passing_test_count: 0,
      pending_test_count: 0,
      failing_test_count: 0,
      test_results: [],
    };

    const syntheticResult: SyntheticResult = {
      start_time: '',
      end_time: '',
      runtime_metadata: {},
    };

    runner
      .on(EVENT_RUN_BEGIN, () => {
        syntheticResult.start_time = new Date().toISOString();
      })
      .on(EVENT_SUITE_BEGIN, (suite: Mocha.Suite) => {
        // Only add root suite when it has tests directly in it.
        if (!suite.root || suite.tests.length > 0) {
          testFrameworkResult.suite_count =
            (testFrameworkResult.suite_count ?? 0) + 1;
        }
      })
      .on(EVENT_TEST_BEGIN, () => {
        testFrameworkResult.test_count =
          (testFrameworkResult.test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_PASS, (test: Mocha.Test) => {
        testFrameworkResult.test_results.push(serializeTest(test, undefined));
        testFrameworkResult.passing_test_count =
          (testFrameworkResult.passing_test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_FAIL, (test: Mocha.Test, err: Error) => {
        testFrameworkResult.test_results.push(serializeTest(test, err));
        testFrameworkResult.failing_test_count =
          (testFrameworkResult.failing_test_count ?? 0) + 1;
      })
      .on(EVENT_TEST_PENDING, () => {
        testFrameworkResult.pending_test_count =
          (testFrameworkResult.pending_test_count ?? 0) + 1;
      })
      .on(EVENT_RUN_END, () => {
        syntheticResult.end_time = new Date().toISOString();
        syntheticResult.synthetic_test_framework_result_v1 =
          testFrameworkResult;

        const json = JSON.stringify(
          SyntheticResult.toJSON(syntheticResult),
          null,
          2
        );
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
 * @param test - Test that was ran by mocha, pass & duration stats
 *                       being relevant.
 * @param err - Error thrown when a test fails.
 * @returns Serialized results relevant for reporting by
 *                            Cloud Monitoring.
 */
export function serializeTest(
  test: Mocha.Test,
  err: NodeJS.ErrnoException | undefined
): TestResult {
  const now = Date.now();
  return {
    // Relevant for uptime metrics
    test_passed: !err,
    test_start_time: new Date(now - (test.duration ?? 0)).toISOString(),
    test_end_time: new Date(now).toISOString(),
    // metadata for logging
    title: test.title,
    title_paths: test.titlePath(),
    test_error: err
      ? {
          error_type: err.name,
          error_message: err.message,
          stack_frames: serializeStack(err.stack || ''),
        }
      : undefined,
  };
}

module.exports = GcmSyntheticsReporter;
