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
import { firstUserErrorStackFrame } from '../../src/handlers';
import ErrorStackParser = require('error-stack-parser');

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

    let e: Error | undefined;
    const handlerFunction = () => {
      e = new AssertionError('Did not assert');
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
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.file_path).to.equal('/user/code/location.js');
    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.line).to.equal(8);
    expect(syntheticResult?.runtime_metadata).to.not.be.undefined;

    expect(syntheticResult?.synthetic_generic_result_v1?.generic_error?.stack_trace).to.equal((e as Error).stack);
  });

  describe('firstUserErrorStackFrame', () => {
    it('returns the first user location in a stack frame', () => {
      const err = new Error();
      err.stack = `Error: Things keep happening!
      '\n    at Module._compile (module.js:456:26)
      '\n    at MyClass.Function (/user/my/file.js:6:11)
      '\n    at Object.<anonymous> (/home/my/other_file.js:5:3)`

      const frame = firstUserErrorStackFrame(ErrorStackParser.parse(err));

      expect(frame?.columnNumber).to.equal(11);
      expect(frame?.lineNumber).to.equal(6);
      expect(frame?.fileName).to.equal('/user/my/file.js');
      expect(frame?.functionName).to.equal('MyClass.Function');
      expect(frame?.source).to.equal(
        '    at MyClass.Function (/user/my/file.js:6:11)');
    });

    it('ignores the async prefix in the filename of a stack trace', () => {
      const err = new Error();
      err.stack = `Error: Things keep happening!
      '\n    at Module._compile (module.js:456:26)
      '\n    at async MyClass.Function (/user/my/file.js:6:11)
      '\n    at Object.<anonymous> (/home/my/other_file.js:5:3)`

      const frame = firstUserErrorStackFrame(ErrorStackParser.parse(err));

      expect(frame?.columnNumber).to.equal(11);
      expect(frame?.lineNumber).to.equal(6);
      expect(frame?.fileName).to.equal('/user/my/file.js');
      expect(frame?.functionName).to.equal('async MyClass.Function');
      expect(frame?.source).to.equal(
        '    at async MyClass.Function (/user/my/file.js:6:11)');
    });
  });

  it('has execution id available', async () => {
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
});
