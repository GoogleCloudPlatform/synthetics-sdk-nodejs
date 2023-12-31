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

const { runSyntheticHandler, instantiateAutoInstrumentation } = require('../../src/index');
instantiateAutoInstrumentation();
const functions = require('@google-cloud/functions-framework');
import { AssertionError } from 'chai';

functions.http('SyntheticOk', runSyntheticHandler(async ({logger}) => {
  logger.info('This is a log');
  return await true;
}));

functions.http('SyntheticNotOk', runSyntheticHandler(async ({logger}) => {
    const e = new AssertionError('Did not assert');
    const splitStack = e.stack?.split('\n', 2) ?? '';
    logger.error('This is an error log');
    e.stack = [
      splitStack?.[0],
      '    at internalFn (node:internal)',
      '    at async fn (/user/code/location.js:8:3)'
    ].join('\n');
    throw e;
}));
