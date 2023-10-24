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
  it('exits early if origin_uri is in an incorrect format', async () => {
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_uri: 'fake-uri.html',
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const broken_links_result =
      syntheticResult.synthetic_broken_links_result_v1;
    expect(broken_links_result?.origin_link_result?.link_passed).to.be.false;
    expect(broken_links_result?.followed_link_results?.length).to.equal(0);
  }).timeout(15000);

  it('returns generic_result with appropriate error information if error thrown', async () => {
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_uri: 'uri-does-not-start-with-http',
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const genericResult = syntheticResult.synthetic_generic_result_v1;
    expect(genericResult).to.be.exist;
    expect(genericResult?.ok).to.be.false;
    expect(genericResult?.generic_error?.error_type).to.equal('Error');
    expect(genericResult?.generic_error?.error_message).to.equal(
      'origin_uri must be a string that starts with `http`'
    );
  }).timeout(15000);

  it('returns broken_links_result with origin link failure when waitForSelector exceeds deadline', async () => {
    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      wait_for_selector: 'not_present',
      link_timeout_millis: 3001,
    };

    const syntheticResult = await runBrokenLinks(inputOptions);

    const broken_links_result =
      syntheticResult?.synthetic_broken_links_result_v1;
    const origin_link = broken_links_result?.origin_link_result;

    expect(broken_links_result?.followed_link_results).to.be.empty;
    expect(origin_link?.link_passed).to.be.false;
    expect(origin_link?.error_type).to.equal('TimeoutError');
    expect(origin_link?.error_message).to.equal(
      'Waiting for selector `not_present` failed: Waiting failed: 3001ms exceeded'
    );
  }).timeout(15000);

  it('Global timeout occurs during checkOriginLink waiting for `wait_for_selector', async () => {
    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      wait_for_selector: 'none existent',
      link_timeout_millis: 5000,
    };
    const result = await runBrokenLinks(inputOptions, 3000);
    const broken_links_result = result.synthetic_broken_links_result_v1;

    const expectedOriginLinkResult: BrokenLinksResultV1_SyntheticLinkResult = {
      link_passed: false,
      expected_status_code: status_class_2xx,
      source_uri: origin_uri,
      target_uri: origin_uri,
      html_element: '',
      anchor_text: '',
      status_code: 200,
      error_type: 'TimeoutError',
      error_message:
        "Global Timeout of 300 secs hit while waiting for selector 'none existent'",
      link_start_time: 'NA',
      link_end_time: 'NA',
      is_origin: true,
    };

    expect(broken_links_result?.origin_link_result)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedOriginLinkResult);
    expect(broken_links_result?.followed_link_results.length).to.equal(0);
  }).timeout(5000);

  it('successful execution with 1 failing link', async () => {
    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      wait_for_selector: '',
    };

    const result = await runBrokenLinks(inputOptions);

    const expectedOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions = {
      origin_uri: origin_uri,
      link_limit: 50,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      link_order:
        BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
      link_timeout_millis: 30000,
      max_retries: 0,
      wait_for_selector: '',
      per_link_options: {},
    };

    const expectedOriginLinkResult: BrokenLinksResultV1_SyntheticLinkResult = {
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
    };

    const file_doesnt_exist_path = `file://${path.join(
      __dirname,
      '../example_html_files/file_doesnt_exist.html'
    )}`
      .split(' ')
      .join('%20');
    const expectedFollowedLinksResults: BrokenLinksResultV1_SyntheticLinkResult[] =
      [
        {
          link_passed: true,
          expected_status_code: status_class_2xx,
          source_uri: origin_uri,
          target_uri: 'CHECKED_BELOW',
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
          source_uri: origin_uri,
          target_uri: 'CHECKED_BELOW',
          html_element: 'img',
          anchor_text: '',
          status_code: undefined,
          error_type: 'Error',
          error_message: 'net::ERR_FILE_NOT_FOUND at ' + file_doesnt_exist_path,
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
    expect(broken_links_result?.unreachable_count).to.equal(1);
    expect(broken_links_result?.status2xx_count).to.equal(2);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    expect(broken_links_result?.origin_link_result)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedOriginLinkResult);

    const sorted_followed_links_result =
      broken_links_result?.followed_link_results.sort((a, b) =>
        a.target_uri.localeCompare(b.target_uri)
      );
    expect(sorted_followed_links_result)
      .excluding(['target_uri', 'link_start_time', 'link_end_time'])
      .to.deep.equal(expectedFollowedLinksResults);

    // these are checked separately because path and puppeteer format space differently which cause the equality assertion to fail
    const expectedTargeturis = [
      '/example_html_files/200.html',
      '/example_html_files/file_doesnt_exist.html',
    ];
    broken_links_result?.followed_link_results?.forEach((link, index) => {
      expect(link.target_uri.endsWith(expectedTargeturis[index]));
    });
  }).timeout(150000);
});
