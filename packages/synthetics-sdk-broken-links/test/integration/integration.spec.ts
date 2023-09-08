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

import {
  ResponseStatusCode_StatusClass,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';

import { expect } from 'chai';
import supertest from 'supertest';
const path = require('path');

require('../../test/example_html_files/integration_server.js');
const { getTestServer } = require('@google-cloud/functions-framework/testing');

describe('CloudFunctionV2 Running Broken Link Synthetics', async () => {
  const status_class_2xx = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  it('runs a passing broken links suite with defaults', async () => {
    const server = getTestServer('BrokenLinksDefaultsOk');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const origin_url = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
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

    expect(broken_links_result?.link_count).to.equal(4);
    expect(broken_links_result?.passing_link_count).to.equal(4);
    expect(broken_links_result?.failing_link_count).to.equal(0);
    expect(broken_links_result?.unreachable_count).to.equal(0);
    expect(broken_links_result?.status_2xx_count).to.equal(4);
    expect(broken_links_result?.status_3xx_count).to.equal(0);
    expect(broken_links_result?.status_4xx_count).to.equal(0);
    expect(broken_links_result?.status_5xx_count).to.equal(0);

    expect(options)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        origin_url: origin_url,
        link_limit: 50,
        query_selector_all: 'a',
        get_attributes: ['href'],
        link_order:
          BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
        link_timeout_millis: 30000,
        max_retries: 0,
        max_redirects: Number.MAX_SAFE_INTEGER,
        wait_for_selector: '',
        per_link_options: {},
      });

    expect(origin_link)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        link_passed: true,
        expected_status_code: status_class_2xx,
        origin_url: origin_url,
        target_url: origin_url,
        html_element: '',
        anchor_text: '',
        status_code: 200,
        error_type: '',
        error_message: '',
        link_start_time: 'NA',
        link_end_time: 'NA',
        is_origin: true,
      });

    expect(followed_links)
      .excluding(['target_url', 'link_start_time', 'link_end_time'])
      .to.deep.equal([
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Internal Relative Link',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
        {
          link_passed: true,
          expected_status_code: { status_class: 200 },
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Other Link',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Anchor Link (Just #)',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
      ]);

    const expectedTargetPaths = [
      'example_html_files/retrieve_links_test.html/nested_files/about.html',
      'example_html_files/basic_example.html',
      'example_html_files/retrieve_links_test.html#',
    ];
    followed_links?.forEach((link, index) => {
      expect(link.target_url.endsWith(expectedTargetPaths[index]));
    });

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(300000);

  it('returns a generic error when inputOptions is invalid', async () => {
    const server = getTestServer('BrokenLinksInvalidOptionsNotOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const synthetic_generic_result = output?.synthetic_generic_result_v1;
    const runtime_metadata = output?.runtime_metadata;

    expect(synthetic_generic_result?.ok).to.be.false;
    expect(synthetic_generic_result?.generic_error?.error_type).to.equal(
      'Error'
    );
    expect(synthetic_generic_result?.generic_error?.error_message).to.equal(
      'Invalid link_order value, must be `FIRST_N` or `RANDOM`'
    );
    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  });

  // handler
  it('runs a passing broken links suite with defaults using runBrokenLinksHandler', async () => {
    const server = getTestServer('BrokenLinksDefaultsHandlerOk');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const origin_url = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
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

    expect(broken_links_result?.link_count).to.equal(4);
    expect(broken_links_result?.passing_link_count).to.equal(4);
    expect(broken_links_result?.failing_link_count).to.equal(0);
    expect(broken_links_result?.unreachable_count).to.equal(0);
    expect(broken_links_result?.status_2xx_count).to.equal(4);
    expect(broken_links_result?.status_3xx_count).to.equal(0);
    expect(broken_links_result?.status_4xx_count).to.equal(0);
    expect(broken_links_result?.status_5xx_count).to.equal(0);

    expect(options)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        origin_url: origin_url,
        link_limit: 50,
        query_selector_all: 'a',
        get_attributes: ['href'],
        link_order:
          BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
        link_timeout_millis: 30000,
        max_retries: 0,
        max_redirects: Number.MAX_SAFE_INTEGER,
        wait_for_selector: '',
        per_link_options: {},
      });

    expect(origin_link)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        link_passed: true,
        expected_status_code: status_class_2xx,
        origin_url: origin_url,
        target_url: origin_url,
        html_element: '',
        anchor_text: '',
        status_code: 200,
        error_type: '',
        error_message: '',
        link_start_time: 'NA',
        link_end_time: 'NA',
        is_origin: true,
      });

    expect(followed_links)
      .excluding(['target_url', 'link_start_time', 'link_end_time'])
      .to.deep.equal([
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Internal Relative Link',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
        {
          link_passed: true,
          expected_status_code: { status_class: 200 },
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Other Link',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'CHECKED_BELOW',
          html_element: 'a',
          anchor_text: 'Anchor Link (Just #)',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
      ]);

    const expectedTargetPaths = [
      'example_html_files/retrieve_links_test.html/nested_files/about.html',
      'example_html_files/basic_example.html',
      'example_html_files/retrieve_links_test.html#',
    ];
    followed_links?.forEach((link, index) => {
      expect(link.target_url.endsWith(expectedTargetPaths[index]));
    });

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(300000);

  it('returns a generic error when inputOptions is invalid using runBrokenLinksHandler', async () => {
    const server = getTestServer('BrokenLinksInvalidOptionsHandlerNotOk');

    // invoke SyntheticMochaSuite with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const synthetic_generic_result = output?.synthetic_generic_result_v1;
    const runtime_metadata = output?.runtime_metadata;

    expect(synthetic_generic_result?.ok).to.be.false;
    expect(synthetic_generic_result?.generic_error?.error_type).to.equal(
      'Error'
    );
    expect(synthetic_generic_result?.generic_error?.error_message).to.equal(
      'Invalid link_order value, must be `FIRST_N` or `RANDOM`'
    );
    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  });
});
