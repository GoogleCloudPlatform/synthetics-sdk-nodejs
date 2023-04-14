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

import { expect } from 'chai';
import * as fs from 'fs';
import * as Mocha from 'mocha';
import * as path from 'path';

import { TestFrameworkResultV1 } from '@google-cloud/synthetics-sdk-api';

const reporterPath = path.join(
  __dirname,
  '..',
  '..',
  'build',
  'src',
  'gcm_synthetics_mocha_reporter.js'
);
const testResultFile = '/tmp/gcm_synthetics_mocha_reporter.spec.ts/output';

describe('gcm_synthetic_reporter', () => {
  let mocha: Mocha;
  let passingTest: Mocha.Test;
  let failingTest: Mocha.Test;
  let passingTest2: Mocha.Test;
  let pendingTest: Mocha.Test;

  beforeEach(() => {
    mocha = new Mocha({
      reporter: reporterPath,
      reporterOptions: { output: testResultFile },
    });

    passingTest = new Mocha.Test('passing test', () => {});
    failingTest = new Mocha.Test('failing test', () => {
      const innerFn = function innerFn() {
        throw new Error('this test has failed');
      };
      innerFn();
    });
    passingTest2 = new Mocha.Test('passing test 2', () => {});
    pendingTest = new Mocha.Test('pending test');
  });

  const readOutputFile = (): TestFrameworkResultV1 => {
    const output = fs.readFileSync(testResultFile, { encoding: 'utf-8' });
    fs.unlinkSync(testResultFile);
    return JSON.parse(output);
  };

  it('Contains information for a passing test', (done) => {
    mocha.suite.addTest(passingTest);

    mocha.run(() => {
      const testFrameworkResult = readOutputFile();
      try {
        expect(testFrameworkResult?.suite_count).to.equal(1);
        expect(testFrameworkResult?.test_count).to.equal(1);
        expect(testFrameworkResult?.passing_test_count).to.equal(1);
        expect(testFrameworkResult?.pending_test_count).to.equal(0);
        expect(testFrameworkResult?.failing_test_count).to.equal(0);

        expect(testFrameworkResult?.test_results).to.have.length(1);
        expect(testFrameworkResult?.test_results?.[0]?.test_passed).to.be.true;
        expect(testFrameworkResult?.test_results?.[0]?.title).to.equal('passing test');
        expect(testFrameworkResult?.test_results?.[0]?.title_paths).to.deep.equal(['passing test']);

        expect(testFrameworkResult?.test_results?.[0]?.error).to.be.undefined;
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('Reports information for a failing test', (done) => {
    mocha.suite.addTest(failingTest);

    mocha.run(() => {
      const testFrameworkResult = readOutputFile();
      try {
        expect(testFrameworkResult?.suite_count).to.equal(1);
        expect(testFrameworkResult?.test_count).to.equal(1);
        expect(testFrameworkResult?.passing_test_count).to.equal(0);
        expect(testFrameworkResult?.pending_test_count).to.equal(0);
        expect(testFrameworkResult?.failing_test_count).to.equal(1);

        expect(testFrameworkResult?.test_results).to.have.length(1);
        expect(testFrameworkResult?.test_results?.[0]?.test_passed).to.be.false;
        expect(testFrameworkResult?.test_results?.[0]?.title).to.equal('failing test');
        expect(testFrameworkResult?.test_results?.[0]?.title_paths).to.deep.equal(['failing test']);

        const error = testFrameworkResult?.test_results?.[0]?.error;
        expect(error?.error_name).to.equal('Error');
        expect(error?.error_message).to.equal('this test has failed');

        expect(error?.stack_frames?.[0]?.function_name).to.equal('innerFn');
        expect(error?.stack_frames?.[0]?.file_name).to.equal(
          'test/unit/gcm_synthetics_mocha_reporter.spec.ts'
        );
        expect(error?.stack_frames?.[0]?.line).to.not.be.undefined;
        expect(error?.stack_frames?.[0]?.column).to.not.be.undefined;

        expect(error?.stack_frames?.[1]?.function_name).to.equal(
          'Context.<anonymous>'
        );
        expect(error?.stack_frames?.[1]?.file_name).to.equal(
          'test/unit/gcm_synthetics_mocha_reporter.spec.ts'
        );
        expect(error?.stack_frames?.[1]?.line).to.not.be.undefined;
        expect(error?.stack_frames?.[1]?.column).to.not.be.undefined;

        expect(error?.stack_frames?.[2]?.function_name).to.equal(
          'processImmediate'
        );
        expect(error?.stack_frames?.[2]?.file_name).to.equal(
          'node:internal/timers'
        );
        expect(error?.stack_frames?.[2]?.line).to.not.be.undefined;
        expect(error?.stack_frames?.[2]?.column).to.not.be.undefined;

        done();
      } catch (e) {
        done(e);
      }
    });
  });
  it('Reports information for a pending test', (done) => {
    mocha.suite.addTest(pendingTest);

    mocha.run(() => {
      const testFrameworkResult = readOutputFile();
      try {
        expect(testFrameworkResult?.suite_count).to.equal(1);
        expect(testFrameworkResult?.test_count).to.equal(0);
        expect(testFrameworkResult?.passing_test_count).to.equal(0);
        expect(testFrameworkResult?.pending_test_count).to.equal(1);
        expect(testFrameworkResult?.failing_test_count).to.equal(0);

        expect(testFrameworkResult?.test_results).to.have.length(0);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('Reports information for multiple tests', (done) => {
    mocha.suite.addTest(passingTest);
    mocha.suite.addTest(failingTest);
    const subSuite = new Mocha.Suite('sub suite');
    subSuite.addTest(pendingTest);
    subSuite.addTest(passingTest2);
    mocha.suite.addSuite(subSuite);

    mocha.run(() => {
      const testFrameworkResult = readOutputFile();
      try {
        expect(testFrameworkResult?.suite_count).to.equal(2);
        expect(testFrameworkResult?.test_count).to.equal(3);
        expect(testFrameworkResult?.passing_test_count).to.equal(2);
        expect(testFrameworkResult?.pending_test_count).to.equal(1);
        expect(testFrameworkResult?.failing_test_count).to.equal(1);

        expect(testFrameworkResult?.test_results).to.have.length(3);

        expect(testFrameworkResult?.test_results?.[0]?.test_passed).to.be.true;
        expect(testFrameworkResult?.test_results?.[0]?.title).to.equal('passing test');
        expect(testFrameworkResult?.test_results?.[0]?.title_paths).to.deep.equal(['passing test']);

        expect(testFrameworkResult?.test_results?.[1]?.test_passed).to.be.false;
        expect(testFrameworkResult?.test_results?.[1]?.title).to.equal('failing test');
        expect(testFrameworkResult?.test_results?.[1]?.title_paths).to.deep.equal(['failing test']);

        expect(testFrameworkResult?.test_results?.[2]?.test_passed).to.be.true;
        expect(testFrameworkResult?.test_results?.[2]?.title).to.equal('passing test 2');
        expect(testFrameworkResult?.test_results?.[2]?.title_paths).to.deep.equal([
          'sub suite',
          'passing test 2',
        ]);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('Reports relatively accurate timings', (done) => {
    mocha.suite.addTest(failingTest);

    const start = new Date();
    mocha.run(() => {
      const end = new Date();

      const testFrameworkResult = readOutputFile();
      const suiteStart = new Date(testFrameworkResult?.suite_start_time ?? '');
      const suiteEnd = new Date(testFrameworkResult?.suite_end_time ?? '');

      try {
        expect(suiteStart >= start).to.be.true;
        expect(suiteEnd <= end).to.be.true;

        expect(new Date(testFrameworkResult?.test_results?.[0].test_start_time ?? '') >= suiteStart)
          .to.be.true;
        expect(new Date(testFrameworkResult?.test_results?.[0]?.test_end_time ?? '') <= suiteEnd).to
          .be.true;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
