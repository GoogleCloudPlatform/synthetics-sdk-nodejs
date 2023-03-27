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

import { SyntheticResult } from 'synthetics-sdk-api';

import { expect } from 'chai';
import * as supertest from 'supertest';

require('../../test/example_test_files/integration_server.js');
const { getTestServer } = require('@google-cloud/functions-framework/testing');

describe('CloudFunctionV2 Running Synthetics', () => {
  it('runs a passing mocha_tests suite', async () => {
    const server = getTestServer('SyntheticOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const suite_result = output?.synthetic_mocha_result?.suite_result;
    const test_results = output?.synthetic_mocha_result?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(suite_result?.suite_count).to.equal(1);
    expect(suite_result?.test_count).to.equal(1);
    expect(suite_result?.passing_test_count).to.equal(1);
    expect(suite_result?.failing_test_count).to.equal(0);
    expect(suite_result?.pending_test_count).to.equal(0);
    expect(suite_result?.suite_start_time).to.be.a.string;
    expect(suite_result?.suite_end_time).to.be.a.string;

    expect(test_results).to.have.length(1);

    const test_result = test_results?.[0];
    expect(test_result?.title).to.equal('is ok');
    expect(test_result?.test_passed).to.equal(true);
    expect(test_result?.title_paths).to.deep.equal(['is ok']);
    expect(test_result?.test_start_time).to.be.a.string;
    expect(test_result?.test_end_time).to.be.a.string;

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs a failing mocha_test suite', async () => {
    const server = getTestServer('SyntheticNotOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const suite_result = output?.synthetic_mocha_result?.suite_result;
    const test_results = output?.synthetic_mocha_result?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(suite_result?.suite_count).to.equal(1);
    expect(suite_result?.test_count).to.equal(1);
    expect(suite_result?.passing_test_count).to.equal(0);
    expect(suite_result?.failing_test_count).to.equal(1);
    expect(suite_result?.pending_test_count).to.equal(0);
    expect(suite_result?.suite_start_time).to.be.a.string;
    expect(suite_result?.suite_end_time).to.be.a.string;

    expect(test_results).to.have.length(1);

    const test_result = test_results?.[0];
    expect(test_result?.title).to.equal('is a native function error');
    expect(test_result?.test_passed).to.equal(false);
    expect(test_result?.title_paths).to.deep.equal([
      'is a native function error',
    ]);
    expect(test_result?.test_start_time).to.be.a.string;
    expect(test_result?.test_end_time).to.be.a.string;

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs multiple mocha_tests suites', async () => {
    const server = getTestServer('SyntheticMultiple');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const suite_result = output?.synthetic_mocha_result?.suite_result;
    const test_results = output?.synthetic_mocha_result?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(suite_result?.suite_count).to.equal(2);
    expect(suite_result?.test_count).to.equal(3);
    expect(suite_result?.passing_test_count).to.equal(1);
    expect(suite_result?.failing_test_count).to.equal(2);
    expect(suite_result?.pending_test_count).to.equal(1);
    expect(suite_result?.suite_start_time).to.be.a.string;
    expect(suite_result?.suite_end_time).to.be.a.string;

    expect(test_results).to.have.length(3);
    expect(runtime_metadata).to.not.be.undefined;
  });

  it('returns a generic error if the mocha suite fails to run', async () => {
    const server = getTestServer('SyntheticFailsToRun');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const synthetic_generic_result = output?.synthetic_generic_result;
    const runtime_metadata = output?.runtime_metadata;

    expect(synthetic_generic_result?.is_ok).to.be.false;
    expect(synthetic_generic_result?.error?.name).to.equal('Error');
    expect(synthetic_generic_result?.error?.message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );

    expect(runtime_metadata).to.not.be.undefined;
  });
});
