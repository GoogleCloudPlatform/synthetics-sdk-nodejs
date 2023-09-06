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
import { expect, use } from 'chai';
import chaiExclude from 'chai-exclude';
use(chaiExclude);

import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  runBrokenLinks,
  BrokenLinkCheckerOptions,
} from '../../src/broken_links';
const path = require('path');

describe('runBrokenLinks', async () => {
  const status_class_2xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  it('exits early if origin_url is in an incorrect format', async () => {
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_url: 'fake-url.html',
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const broken_links_result =
      syntheticResult.synthetic_broken_links_result_v1;
    expect(broken_links_result?.origin_link_result?.link_passed).to.be.false;
    expect(broken_links_result?.followed_link_results?.length).to.equal(0);
  });

  it('returns generic_result with appropriate error information if error thrown', async () => {
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_url: 'url-does-not-start-with-http',
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const genericResult = syntheticResult.synthetic_generic_result_v1;
    expect(genericResult).to.be.exist;
    expect(genericResult?.ok).to.be.false;
    expect(genericResult?.generic_error?.error_type).to.equal('Error');
    expect(genericResult?.generic_error?.error_message).to.equal(
      'origin_url must be a string that starts with `http`'
    );
  }).timeout(10000);

  it('returns generic_result when waitForSelector exceeds deadline', async () => {
    const origin_url = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_url: origin_url,
      wait_for_selector: 'not_present',
      link_timeout_millis: 3001,
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const genericResult = syntheticResult.synthetic_generic_result_v1;
    expect(genericResult).to.be.exist;
    expect(genericResult?.ok).to.be.false;
    expect(genericResult?.generic_error?.error_type).to.equal('Error');
    expect(genericResult?.generic_error?.error_message).to.equal(
      'Waiting for selector `not_present` failed: Waiting failed: 3001ms exceeded'
    );
  }).timeout(10000);

  it('successful execution', async () => {
    const origin_url = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_url: origin_url,
      query_selector_all: 'a[src], img',
      get_attributes: ['href', 'src'],
    };

    const result = await runBrokenLinks(inputOptions);
    console.log(result);

    const expectedOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions = {
      origin_url: origin_url,
      link_limit: 50,
      query_selector_all: 'a[src], img',
      get_attributes: ['href', 'src'],
      link_order:
        BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
      link_timeout_millis: 30000,
      max_retries: 0,
      max_redirects: Number.MAX_SAFE_INTEGER,
      wait_for_selector: '',
      per_link_options: {},
    };

    const expectedOriginLinkResult: BrokenLinksResultV1_SyntheticLinkResult = {
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
    };

    const expectedFollowedLinksResults: BrokenLinksResultV1_SyntheticLinkResult[] =
      [
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'https://www.example.com/',
          html_element: 'a',
          anchor_text: 'External Link',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
        {
          link_passed: false,
          expected_status_code: status_class_2xx,
          origin_url: origin_url,
          target_url: 'https://www.example.com/image.jpg',
          html_element: 'img',
          anchor_text: '',
          status_code: 404,
          error_type: 'BrokenLinksSynthetic_IncorrectStatusCode',
          error_message:
            'https://www.example.com/image.jpg returned status code 404 when a 200 status class was expected.',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
      ];

    const broken_links_result = result.synthetic_broken_links_result_v1;
    expect(broken_links_result?.options)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedOptions);

    expect(broken_links_result?.link_count).to.equal(3);
    expect(broken_links_result?.passing_link_count).to.equal(2);
    expect(broken_links_result?.failing_link_count).to.equal(1);
    expect(broken_links_result?.unreachable_count).to.equal(0);
    expect(broken_links_result?.status_2xx_count).to.equal(2);
    expect(broken_links_result?.status_3xx_count).to.equal(0);
    expect(broken_links_result?.status_4xx_count).to.equal(1);
    expect(broken_links_result?.status_5xx_count).to.equal(0);

    expect(broken_links_result?.origin_link_result)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedOriginLinkResult);

    expect(broken_links_result?.followed_link_results)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedFollowedLinksResults);
  }).timeout(10000);
});
