// Copyright 2023 Google LLC
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
const fetch = require('node-fetch');
const { runSyntheticHandler } = require('@google-cloud/synthetics-sdk-api');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions. It is unlikely that you should need to change the
 * contents of this function.
 */
functions.http('SyntheticFunction', runSyntheticHandler(async () => {
  /*
   * This is the function that should run your code synthetic code. This should
   * either exit without issue, in which case the synthetic is considered a
   * success, or it should throw an Error, in which case the synthetic is
   * considered a failure.
   */
  const url = 'https://www.google.com/'; // URL to send the request to
  return await fetch(url);
}));