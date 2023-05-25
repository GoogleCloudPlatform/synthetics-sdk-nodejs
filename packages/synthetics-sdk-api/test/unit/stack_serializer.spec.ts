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

import { serializeStack, serializeLocation } from '../../src/stack_serializer';
import { AssertionError, expect } from 'chai';

const throwsErrorFn = () => {
  throw new Error('oh no!');
}

describe('serializeStack', () => {
  it('serializes base Error stack', () => {
    try {
      throwsErrorFn();
    } 
    catch (e) {
      console.log((e as Error).stack);
      const stack = serializeStack((e as Error).stack || '');

      expect(stack[0].line).to.equal(19);
      expect(stack[0].function_name).to.equal('throwsErrorFn')
      expect(stack[0].file_path).to.contain('stack_serializer.spec.ts');
      expect(stack[0].column).to.equal(9);

      expect(stack[1].line).to.not.be.undefined;
      expect(stack[1].function_name).to.equal('Context.<anonymous>');
      expect(stack[1].file_path).to.contain('stack_serializer.spec.ts');
      expect(stack[1].column).to.exist;

      expect(stack.find(s => s.file_path == 'node:internal/timers')).to.exist;
    }
 })
});

describe('serializeLocation', () => {
  it('serializes a native function', () => {
    expect(serializeLocation('node:internal/timers:476:21')).to.deep.equal({
      file_path: 'node:internal/timers',
      line: 476,
      column: 21
    });
  });

  it('serializes any calls to an internal nodejs function', () => {
    expect(serializeLocation('internal/process/next_tick.js:124:9')).to.deep.equal({
      file_path: 'internal/process/next_tick.js',
      line: 124,
      column: 9
    });
  });

  it('serializes any calls to an internal nodejs function', () => {
    expect(serializeLocation('internal/process/next_tick.js:124:9')).to.deep.equal({
      file_path: 'internal/process/next_tick.js',
      line: 124,
      column: 9
    });
  });

  it('serializes any calls to external program errors', () => {
    expect(serializeLocation('<transport-protocol>:///url/to/module/file.mjs:5:20')).to.deep.equal({
      file_path: '<transport-protocol>:///url/to/module/file.mjs',
      line: 5,
      column: 20
    });
  })
});