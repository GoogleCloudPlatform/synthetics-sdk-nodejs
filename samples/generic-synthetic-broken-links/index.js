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
const { runSyntheticHandler } = require('@google-cloud/synthetics-sdk-api');
const { crawl } = require('./brokenLinkChecker');

functions.http('SyntheticFunction', runSyntheticHandler(async () => {
  /*
   * This is the function that should run your code synthetic code. This should
   * either exit without issue, in which case the synthetic is considered a
   * success, or it should throw an Error, in which case the synthetic is
   * considered a failure.
   */
  const link_failures = await crawl('https://www.example.com/', 50, 10000);
  return link_failures;
}));
