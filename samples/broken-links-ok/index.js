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
const GcmSynthetics = require('@google-cloud/synthetics-sdk-broken-links');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */


const options = {
  origin_uri: "https://example.com",
  // link_limit: 50,
  // query_selector_all: "a", // https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
  // get_attributes: ['href'], // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
  // link_order: "FIRST_N", // "FIRST_N" or "RANDOM"
  // link_timeout_millis: 30000, // timeout per link
  // max_redirects: undefined, // unlimited
  // max_retries: 0, //
  // wait_for_selector: '', // https://pptr.dev/api/puppeteer.page.waitforselector
  // per_link_options: {}
    /*
    example:
      per_link_options: {
        'http://fake-link1': { expected_status_code: "STATUS_CLASS_4XX" },
        'http://fake-link2': { expected_status_code: 304 },
        'http://fake-link3': { link_timeout_millis: 10000 },
        'http://fake-link4': {
          expected_status_code: "STATUS_CLASS_3XX",
          link_timeout_millis: 10,
        },
      },
    */
};

functions.http('BrokenLinkChecker', GcmSynthetics.runBrokenLinksHandler(options));
