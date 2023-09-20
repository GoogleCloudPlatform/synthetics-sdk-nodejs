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

require('../../test/example_test_files/integration_server.js');
import { SyntheticResult, TestFrameworkResultV1 } from '../../src';
import { expect } from 'chai';
import supertest from 'supertest';

import { Writable } from 'stream';
import * as sinon from 'sinon';
import winston, { Logger } from 'winston';

const { getTestServer } = require('@google-cloud/functions-framework/testing');
const { getInstrumentedLogger } = require('../../src/auto_instrumentation');

let logger: Logger;
let writeSpy: sinon.SinonSpy;

const traceVersion = '00';
const traceId = '12345678901234567890123456789012';
const traceParentId = '1234567890123456';
const traceFlags = '01';
const traceParentHeader = [traceVersion, traceId, traceParentId, traceFlags].join('-');

describe('CloudFunctionV2 Running Synthetics', async () => {
  beforeEach(async () => {
    const stream = new Writable();
    stream._write = () => {};
    writeSpy = sinon.spy(stream, '_write');

    sinon.replace(process, 'env', {GCLOUD_PROJECT: 'project-id'});

    logger = await getInstrumentedLogger();

    const streamTransport = new winston.transports.Stream({ stream });
    logger.add(streamTransport);
  });

  afterEach(async () => {
    sinon.restore();
  });

  it('runs a passing synthetic function', async () => {
    const server = getTestServer('SyntheticOk');
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .set('traceparent', traceParentHeader)
      .expect(200);

    sinon.assert.calledOnce(writeSpy);

    const record = JSON.parse(writeSpy.firstCall.args[0].toString());
    expect(record['severity']).to.equal('INFO');
    expect(record['message']).to.equal('This is a log');
    expect(record['logging.googleapis.com/spanId']).to.equal('1234567890123456');
    expect(record['logging.googleapis.com/trace']).to.equal('projects/project-id/traces/12345678901234567890123456789012');
    expect(record['logging.googleapis.com/trace_sampled']).to.equal(true);

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
      .set('traceparent', traceParentHeader)
      .expect(200);

    sinon.assert.calledOnce(writeSpy);

    const record = JSON.parse(writeSpy.firstCall.args[0].toString());
    expect(record['message']).to.equal('This is an error log');
    expect(record['severity']).to.equal('ERROR');
    expect(record['logging.googleapis.com/spanId']).to.equal('1234567890123456');
    expect(record['logging.googleapis.com/trace']).to.equal('projects/project-id/traces/12345678901234567890123456789012');
    expect(record['logging.googleapis.com/trace_sampled']).to.equal(true);

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
    expect(generic_result?.generic_error?.stack_trace).to.equal(
      `AssertionError: Did not assert\n\    at internalFn (node:internal)\n\    at async fn (/user/code/location.js:8:3)`);

    expect(runtime_metadata).to.not.be.undefined;
  });
});