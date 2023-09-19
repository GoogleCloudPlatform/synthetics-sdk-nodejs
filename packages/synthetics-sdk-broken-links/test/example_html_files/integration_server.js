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

const functions = require('@google-cloud/functions-framework');
const SyntheticsSdkBrokenLinks = require('synthetics-sdk-broken-links');
const path = require('path');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */

// Handles error when trying to visit page that does not exist
functions.http('BrokenLinksPageDoesNotExist', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/file_doesnt_exist.html'
  )}`
}));

// Visits and checks empty page with no links
functions.http('BrokenLinksEmptyPageOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/200.html'
  )}`
}));

// Exits early when options cannot be parsed
functions.http('BrokenLinksInvalidOptionsNotOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/retrieve_links_test.html'
  )}`,
  link_order: 'incorrect'
}));

// Completes full failing execution
functions.http('BrokenLinksFailingOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/retrieve_links_test.html'
  )}`,
  query_selector_all: 'a[src], img[href]',
  get_attributes: ['href', 'src']
}));

// Completes full passing execution
functions.http('BrokenLinksPassingOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler({
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/retrieve_links_test.html'
  )}`,
  query_selector_all: 'a[src]',
  get_attributes: ['src']
}));
