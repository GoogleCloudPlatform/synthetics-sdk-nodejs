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
const SyntheticsSdkMocha = require('synthetics-sdk-mocha');

describe('GCM Synthetics Mocha', async () => {
  it('returns a GenericResult, when no test spec is provided', async () => {
    const { synthetic_generic_result_v1, runtime_metadata } = await SyntheticsSdkMocha.mocha({
      spec: '',
    });

    expect(synthetic_generic_result_v1?.ok).to.be.false;
    expect(synthetic_generic_result_v1?.error?.error_name).to.equal('Error');
    expect(synthetic_generic_result_v1?.error?.error_message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs passing tests in a file at the provided path', async () => {
    const syntheticMochaResults = await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_passing.spec.js',
    });

    const testFrameworkResult =
      syntheticMochaResults.synthetic_test_framework_result_v1 || {};
    const { runtime_metadata } = syntheticMochaResults;

    expect(testFrameworkResult?.suite_count).to.equal(1);
    expect(testFrameworkResult?.test_count).to.equal(1);
    expect(testFrameworkResult?.passing_test_count).to.equal(1);
    expect(testFrameworkResult?.pending_test_count).to.equal(0);
    expect(testFrameworkResult?.failing_test_count).to.equal(0);

    expect(testFrameworkResult?.test_results).to.have.length(1);
    expect(testFrameworkResult?.test_results).to.not.have.property('error');

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs failing tests in a file at the provided path', async () => {
    const syntheticMochaResults = await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_failing.spec.js',
    });

    const testFrameworkResult =
      syntheticMochaResults.synthetic_test_framework_result_v1 || {};

    expect(testFrameworkResult?.suite_count).to.equal(1);
    expect(testFrameworkResult?.test_count).to.equal(1);
    expect(testFrameworkResult?.passing_test_count).to.equal(0);
    expect(testFrameworkResult?.pending_test_count).to.equal(0);
    expect(testFrameworkResult?.failing_test_count).to.equal(1);

    expect(testFrameworkResult?.test_results).to.have.length(1);
    expect(testFrameworkResult?.test_results?.[0]).to.have.property('error');
  });

  it('runs multiple files of tests at the provided path', async () => {
    const syntheticMochaResults = await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_passing.spec.js ./test/example_test_files/test_failing.spec.js',
    });

    const testFrameworkResult =
      syntheticMochaResults.synthetic_test_framework_result_v1 || {};

    expect(testFrameworkResult?.suite_count).to.equal(1);
    expect(testFrameworkResult?.test_count).to.equal(2);
    expect(testFrameworkResult?.passing_test_count).to.equal(1);
    expect(testFrameworkResult?.pending_test_count).to.equal(0);
    expect(testFrameworkResult?.failing_test_count).to.equal(1);

    expect(testFrameworkResult?.test_results).to.have.length(2);
  });

  it('runs mocha suite with additional flagged parameters', async () => {
    const syntheticMochaResults = await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_passing.spec.js ./test/example_test_files/test_failing.spec.js',
      mochaOptions: '--fgrep error' // Only runs tests with "error" in their name
    });

    const testFrameworkResult =
    syntheticMochaResults.synthetic_test_framework_result_v1 || {};

    expect(testFrameworkResult?.suite_count).to.equal(1);
    expect(testFrameworkResult?.test_count).to.equal(1);
    expect(testFrameworkResult?.passing_test_count).to.equal(0);
    expect(testFrameworkResult?.pending_test_count).to.equal(0);
    expect(testFrameworkResult?.failing_test_count).to.equal(1);

    expect(testFrameworkResult?.test_results).to.have.length(1);
  });

  it('returns an error when a the test file doesnt exist', async () => {
    const { synthetic_generic_result_v1 } = await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_does_not_exist.spec.js',
    });

    expect(synthetic_generic_result_v1?.ok).to.be.false;
    expect(synthetic_generic_result_v1?.error?.error_name).to.equal('Error');
    expect(synthetic_generic_result_v1?.error?.error_message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );
  });

  it('returns a GenericResult, when the test file fails to run', async () => {
    const { synthetic_generic_result_v1, runtime_metadata } =
      await SyntheticsSdkMocha.mocha({
        spec: './test/example_test_files/test_does_not_exist.spec.js',
      });

    expect(synthetic_generic_result_v1?.ok).to.be.false;
    expect(synthetic_generic_result_v1?.error?.error_name).to.equal('Error');
    expect(synthetic_generic_result_v1?.error?.error_message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );

    expect(runtime_metadata).to.not.be.undefined;
  });
});
