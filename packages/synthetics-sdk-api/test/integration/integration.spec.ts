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

import { SyntheticResult } from '../../src'
import { expect } from 'chai';
import supertest from 'supertest';

require('../../test/example_test_files/integration_server.js');
const { getTestServer } = require('@google-cloud/functions-framework/testing');

describe('CloudFunctionV2 Running Synthetics', async () => {
  it('runs a passing synthetic function', async () => {
    const server = getTestServer('SyntheticOk');

    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const generic_result = output?.synthetic_generic_result_v1;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(generic_result?.ok).to.be.true;
    expect(generic_result?.generic_error).to.be.undefined;

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be.undefined;
  });

  it('runs a failing synthetic function', async () => {
    const server = getTestServer('SyntheticNotOk');

    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const generic_result = output?.synthetic_generic_result_v1;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(generic_result?.ok).to.be.false;
    expect(generic_result?.generic_error?.error_message).to.equal('Did not assert');
    expect(generic_result?.generic_error?.error_type).to.equal('AssertionError');
    expect(generic_result?.generic_error?.file_path).to.equal('/user/code/location.js');
    expect(generic_result?.generic_error?.function_name).to.equal('async fn');
    expect(generic_result?.generic_error?.line).to.equal(8);

    expect(runtime_metadata).to.not.be.undefined;
  });
});