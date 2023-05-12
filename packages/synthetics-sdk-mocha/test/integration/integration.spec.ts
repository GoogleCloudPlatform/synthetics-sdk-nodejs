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

import { SyntheticResult } from '@google-cloud/synthetics-sdk-api';

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
    const start_time = output.start_time;
    const end_time = output.end_time;
    const test_framework_result = output?.synthetic_test_framework_result_v1;
    const test_results = output?.synthetic_test_framework_result_v1?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(test_framework_result?.suite_count).to.equal(1);
    expect(test_framework_result?.test_count).to.equal(1);
    expect(test_framework_result?.passing_test_count).to.equal(1);
    expect(test_framework_result?.failing_test_count).to.equal(0);
    expect(test_framework_result?.pending_test_count).to.equal(0);

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
    const start_time = output.start_time;
    const end_time = output.end_time;
    const test_framework_result = output?.synthetic_test_framework_result_v1;
    const test_results = output?.synthetic_test_framework_result_v1?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(test_framework_result?.suite_count).to.equal(1);
    expect(test_framework_result?.test_count).to.equal(1);
    expect(test_framework_result?.passing_test_count).to.equal(0);
    expect(test_framework_result?.failing_test_count).to.equal(1);
    expect(test_framework_result?.pending_test_count).to.equal(0);

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
    const start_time = output.start_time;
    const end_time = output.end_time;
    const test_framework_result = output?.synthetic_test_framework_result_v1;
    const test_results = output?.synthetic_test_framework_result_v1?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(test_framework_result?.suite_count).to.equal(2);
    expect(test_framework_result?.test_count).to.equal(3);
    expect(test_framework_result?.passing_test_count).to.equal(1);
    expect(test_framework_result?.failing_test_count).to.equal(2);
    expect(test_framework_result?.pending_test_count).to.equal(1);

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
    const start_time = output.start_time;
    const end_time = output.end_time;
    const synthetic_generic_result = output?.synthetic_generic_result_v1;
    const runtime_metadata = output?.runtime_metadata;

    expect(synthetic_generic_result?.ok).to.be.false;
    expect(synthetic_generic_result?.generic_error?.error_type).to.equal('Error');
    expect(synthetic_generic_result?.generic_error?.error_message).to.equal(
      'An error occurred while starting or running the mocha test suite. Please reference server logs for further information.'
    );
    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs a passing mocha_test suite using the mochaHandler', async () => {
    const server = getTestServer('SyntheticHandlerOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const test_framework_result = output?.synthetic_test_framework_result_v1;
    const test_results = output?.synthetic_test_framework_result_v1?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(test_framework_result?.suite_count).to.equal(1);
    expect(test_framework_result?.test_count).to.equal(1);
    expect(test_framework_result?.passing_test_count).to.equal(1);
    expect(test_framework_result?.failing_test_count).to.equal(0);
    expect(test_framework_result?.pending_test_count).to.equal(0);

    expect(test_results).to.have.length(1);

    const test_result = test_results?.[0];
    expect(test_result?.title).to.equal('is ok');
    expect(test_result?.test_passed).to.equal(true);
    expect(test_result?.title_paths).to.deep.equal(['is ok']);
    expect(test_result?.test_start_time).to.be.a.string;
    expect(test_result?.test_end_time).to.be.a.string;

    expect(runtime_metadata).to.not.be.undefined;
  });

  it('runs a failing mocha_test suite using the mochaHandler', async () => {
    const server = getTestServer('SyntheticHandlerNotOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const test_framework_result = output?.synthetic_test_framework_result_v1;
    const test_results = output?.synthetic_test_framework_result_v1?.test_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(test_framework_result?.suite_count).to.equal(1);
    expect(test_framework_result?.test_count).to.equal(1);
    expect(test_framework_result?.passing_test_count).to.equal(0);
    expect(test_framework_result?.failing_test_count).to.equal(1);
    expect(test_framework_result?.pending_test_count).to.equal(0);

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
});
