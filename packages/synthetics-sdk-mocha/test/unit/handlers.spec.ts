import { SyntheticResult } from '@google-cloud/synthetics-sdk-api';
import { expect } from 'chai';
const SyntheticsSdkMocha = require('synthetics-sdk-mocha');
import { Request, Response, Send } from 'express';


describe('GCM Synthetics Mocha Handler', async () => {
  it('runs a mocha suite when middleware is invoked', async () => {
    const handler = SyntheticsSdkMocha.mochaHandler({
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