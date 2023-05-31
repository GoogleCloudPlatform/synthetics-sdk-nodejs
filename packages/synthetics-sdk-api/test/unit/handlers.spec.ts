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

import { SyntheticResult, runSyntheticHandler } from '../../src/index';
import { AssertionError, expect } from 'chai';
import { Request, Response } from 'express';

describe('GCM Synthetics Handler', async () => {
  it('runs a passing synthetic function', async () => {
    const start = new Date();
    const handler = runSyntheticHandler(() => true);

    const runHandler = new Promise((resolve) => {
      let mockResponse = {
        send: (body: any) => {
          resolve(body);
        }
      } as Response;

      handler({} as Request, mockResponse);
    });

    const syntheticResult = await runHandler as SyntheticResult;
    const end = new Date();

    const syntheticStart = new Date(syntheticResult?.start_time ?? '');
    const syntheticEnd = new Date(syntheticResult?.end_time ?? '');

    expect(syntheticStart >= start).to.be.true;
    expect(syntheticEnd <= end).to.be.true;
    expect(syntheticResult?.synthetic_generic_result_v1?.ok).to.be.true;
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error).to.be.undefined;
    expect(syntheticResult?.runtime_metadata).to.not.be.undefined;
  });

  it('runs a failing synthetic function', async () => {
    const now = new Date();
    const handler = runSyntheticHandler(() => {
        throw new AssertionError('NOOOOO');
    });

    const runHandler = new Promise((resolve) => {
      let mockResponse = {
        send: (body: any) => {
          resolve(body);
        }
      } as Response;

      handler({} as Request, mockResponse);
    });

    const syntheticResult = await runHandler as SyntheticResult;

    const later = new Date();

    expect(syntheticResult.end_time).to.not.be.undefined;
    expect(syntheticResult.start_time).to.not.be.undefined;
    expect(syntheticResult?.synthetic_generic_result_v1?.ok).to.be.false;
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.error_type).to.equal('AssertionError');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.error_message).to.equal('NOOOOO');
    expect(syntheticResult?.runtime_metadata).to.not.be.undefined;
  });

  it('Assigns first stack frame with user code to the error', async () => {
    const now = new Date();

    const handlerFunction = () => {
      const e = new AssertionError('Did not assert');
      const splitStack = e.stack?.split('\n', 2) ?? '';
      e.stack = [
        splitStack?.[0],
        '    at internalFn (node:internal)',
        '    at async fn (/user/code/location.js:8:3)'
      ].join('\n');
      throw e;
    }

    const handler = runSyntheticHandler(handlerFunction);

    const runHandler = new Promise((resolve) => {
      let mockResponse = {
        send: (body: any) => {
          resolve(body);
        }
      } as Response;

      handler({} as Request, mockResponse);
    });

    const syntheticResult = await runHandler as SyntheticResult;

    const later = new Date();

    expect(syntheticResult.end_time).to.not.be.undefined;
    expect(syntheticResult.start_time).to.not.be.undefined;
    expect(syntheticResult?.synthetic_generic_result_v1?.ok).to.be.false;
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.error_type).to.equal('AssertionError');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.error_message).to.contain('Did not assert');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.function_name).to.contain('async fn');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.file_path).to.contain('user/code/location.js');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.line).to.equal(8);
    expect(syntheticResult?.runtime_metadata).to.not.be.undefined;
  });
});
