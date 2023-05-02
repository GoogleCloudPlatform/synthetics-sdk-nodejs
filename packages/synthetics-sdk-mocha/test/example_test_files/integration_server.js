// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const functions = require('@google-cloud/functions-framework');
const SyntheticsSdkMocha = require('synthetics-sdk-mocha');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */

functions.http('SyntheticOk', async (req, res) => {
  res.send(
    await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_passing.spec.js',
    })
  );
});

functions.http('SyntheticNotOk', async (req, res) => {
  res.send(
    await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_failing.spec.js',
    })
  );
});

functions.http('SyntheticMultiple', async (req, res) => {
  res.send(
    await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_multiple.spec.js',
    })
  );
});

functions.http('SyntheticFailsToRun', async (req, res) => {
  res.send(
    await SyntheticsSdkMocha.mocha({
      spec: './test/example_test_files/test_fails_to_run.spec.js',
    })
  );
});

functions.http('SyntheticHandlerOk', SyntheticsSdkMocha.mochaHandler({
  spec: './test/example_test_files/test_passing.spec.js',
}));

functions.http('SyntheticHandlerNotOk', SyntheticsSdkMocha.mochaHandler({
  spec: './test/example_test_files/test_failing.spec.js',
}));