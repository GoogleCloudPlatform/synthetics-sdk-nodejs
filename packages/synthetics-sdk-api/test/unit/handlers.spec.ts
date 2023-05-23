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
import { Request, Response, Send } from 'express';

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
});