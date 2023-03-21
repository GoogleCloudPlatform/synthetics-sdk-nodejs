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
const GcmSynthetics = require('@google-cloud/gcm-synthetics');
import { MochaResultV1 } from '../../src/proto/synthetic_response';

describe('GCM Synthetics Mocha', async () => {
  it('runs passing tests in a file at the provided path', async () => {
    const syntheticMochaResults = await GcmSynthetics.mocha({
      spec: './test/example_test_files/test_passing.spec.js',
    });

    const { suite_result, test_results }: MochaResultV1 =
      syntheticMochaResults.synthetic_mocha_result;
    const { runtime_metadata } = syntheticMochaResults;

    expect(suite_result?.suite_count).to.equal(1);
    expect(suite_result?.test_count).to.equal(1);
    expect(suite_result?.passing_test_count).to.equal(1);
    expect(suite_result?.pending_test_count).to.equal(0);
    expect(suite_result?.failing_test_count).to.equal(0);

    expect(test_results).to.have.length(1);
    expect(test_results).to.not.have.property('error');

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs failing tests in a file at the provided path', async () => {
    const syntheticMochaResults = await GcmSynthetics.mocha({
      spec: './test/example_test_files/test_failing.spec.js',
    });

    const { suite_result, test_results } =
      syntheticMochaResults.synthetic_mocha_result;

    expect(suite_result?.suite_count).to.equal(1);
    expect(suite_result?.test_count).to.equal(1);
    expect(suite_result?.passing_test_count).to.equal(0);
    expect(suite_result?.pending_test_count).to.equal(0);
    expect(suite_result?.failing_test_count).to.equal(1);

    expect(test_results).to.have.length(1);
    expect(test_results?.[0]).to.have.property('error');
  });

  it('runs multiple files of tests at the provided path', async () => {
    const syntheticMochaResults = await GcmSynthetics.mocha({
      spec: './test/example_test_files/test_passing.spec.js ./test/example_test_files/test_failing.spec.js',
    });

    const { suite_result, test_results } =
      syntheticMochaResults.synthetic_mocha_result;

    expect(suite_result?.suite_count).to.equal(1);
    expect(suite_result?.test_count).to.equal(2);
    expect(suite_result?.passing_test_count).to.equal(1);
    expect(suite_result?.pending_test_count).to.equal(0);
    expect(suite_result?.failing_test_count).to.equal(1);

    expect(test_results).to.have.length(2);
  });

  it('returns an error when a the test file doesnt exist', async () => {
    const { synthetic_generic_result } = await GcmSynthetics.mocha({
      spec: './test/example_test_files/test_does_not_exist.spec.js',
    });

    console.log(synthetic_generic_result);
    expect(synthetic_generic_result.is_ok).to.be.false;
    expect(synthetic_generic_result.error.name).to.equal('Error');
    expect(synthetic_generic_result.error.message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );
  });

  it('returns a GenericResult, when the test file fails to run', async () => {
    const { synthetic_generic_result, runtime_metadata } =
      await GcmSynthetics.mocha({
        spec: './test/example_test_files/test_does_not_exist.spec.js',
      });

    expect(synthetic_generic_result.is_ok).to.be.false;
    expect(synthetic_generic_result.error.name).to.equal('Error');
    expect(synthetic_generic_result.error.message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );

    expect(runtime_metadata).to.not.be.undefined;
  });
});
