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
import { expect } from 'chai';
import supertest from 'supertest';
const path = require('path');

// Internal Project Files
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_CaptureCondition as ApiCaptureCondition,
  BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';

// External Dependencies
require('../../test/example_html_files/integration_server.js');
const { getTestServer } = require('@google-cloud/functions-framework/testing');

describe('CloudFunctionV2 Running Broken Link Synthetics', async () => {
  const status_class_2xx = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  const noneCaptureScreenshotOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions =
    {
      capture_condition: ApiCaptureCondition.NONE,
      storage_location: '',
    };

  const defaultScreenshotOutput: BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput =
    {
      screenshot_file: '',
      screenshot_error: {} as BaseError,
    };

  it('Visits and checks empty page with no links', async () => {
    const server = getTestServer('BrokenLinksEmptyPageOk');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/200.html'
    )}`;

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const broken_links_result = output?.synthetic_broken_links_result_v1;
    const options = broken_links_result?.options;
    const origin_link = broken_links_result?.origin_link_result;
    const followed_links = broken_links_result?.followed_link_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(broken_links_result?.link_count).to.equal(1);
    expect(broken_links_result?.passing_link_count).to.equal(1);
    expect(broken_links_result?.failing_link_count).to.equal(0);
    expect(broken_links_result?.unreachable_count).to.equal(0);
    expect(broken_links_result?.status2xx_count).to.equal(1);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    expect(options).to.deep.equal({
      origin_uri: origin_uri,
      link_limit: 10,
      query_selector_all: 'a',
      get_attributes: ['href'],
      link_order:
        BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
      link_timeout_millis: 30000,
      max_retries: 0,
      wait_for_selector: '',
      per_link_options: {},
      total_synthetic_timeout_millis: 60000,
      screenshot_options: noneCaptureScreenshotOptions,
    });

    expect(origin_link)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        link_passed: true,
        expected_status_code: status_class_2xx,
        source_uri: origin_uri,
        target_uri: origin_uri,
        html_element: '',
        anchor_text: '',
        status_code: 200,
        error_type: '',
        error_message: '',
        link_start_time: 'NA',
        link_end_time: 'NA',
        is_origin: true,
        screenshot_output: defaultScreenshotOutput,
      });

    expect(followed_links).to.deep.equal([]);

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(10000);
});
