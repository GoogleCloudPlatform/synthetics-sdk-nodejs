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

// Standard Libraries
const path = require('path');
// const proxyquire = require('proxyquire');

// const brokenLinksSdkMocked = proxyquire

// Internal Project Files
const SyntheticsSdkBrokenLinks = require('synthetics-sdk-broken-links');

// External Dependencies
const functions = require('@google-cloud/functions-framework');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */

// Visits and checks empty page with no links
functions.http('BrokenLinksEmptyPageOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_uri: `file:${path.join(
    __dirname,
    '../example_html_files/200.html'
  )}`,
  screenshot_options: {
    capture_condition: 'NONE'
  }
}));
