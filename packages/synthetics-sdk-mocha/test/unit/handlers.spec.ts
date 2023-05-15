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
const SyntheticsSdkMocha = require('synthetics-sdk-mocha');
import { Request, Response, Send } from 'express';

describe('GCM Synthetics Mocha Handler', async () => {
  it('runs a mocha suite when middleware is invoked', async () => {
    const handler = SyntheticsSdkMocha.runMochaHandler({
      spec: './test/example_test_files/test_passing.spec.js',
    });

    let mockRequest : Partial<Request> = {};

    const runHandler = new Promise((resolve) => {
      let mockResponse = {
        send: (body: any) => {
          resolve(body);
        }
     };

      handler(mockRequest, mockResponse);
    });

    const syntheticMochaResults = await runHandler as SyntheticResult;

    const testFrameworkResult =
      syntheticMochaResults.synthetic_test_framework_result_v1;
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
});