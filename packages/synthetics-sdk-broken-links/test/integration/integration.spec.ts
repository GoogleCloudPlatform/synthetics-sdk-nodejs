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

  it('Handles error when trying to visit page that does not exist', async () => {
    const server = getTestServer('BrokenLinksPageDoesNotExist');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const output: SyntheticResult = response.body as SyntheticResult;
    const start_time = output.start_time;
    const end_time = output.end_time;
    const broken_links_result = output?.synthetic_broken_links_result_v1;
    const origin_link = broken_links_result?.origin_link_result;
    const followed_links = broken_links_result?.followed_link_results;
    const runtime_metadata = output?.runtime_metadata;

    expect(start_time).to.be.a.string;
    expect(end_time).to.be.a.string;

    expect(broken_links_result?.link_count).to.equal(1);
    expect(broken_links_result?.passing_link_count).to.equal(0);
    expect(broken_links_result?.failing_link_count).to.equal(1);
    expect(broken_links_result?.unreachable_count).to.equal(1);
    expect(broken_links_result?.status2xx_count).to.equal(0);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/file_doesnt_exist.html'
    )}`;

    expect(origin_link)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        link_passed: false,
        expected_status_code: status_class_2xx,
        source_uri: origin_uri,
        target_uri: origin_uri,
        html_element: '',
        anchor_text: '',
        error_type: 'Error',
        error_message: 'net::ERR_FILE_NOT_FOUND at ' + origin_uri,
        link_start_time: 'NA',
        link_end_time: 'NA',
        is_origin: true,
      });

    expect(followed_links).to.deep.equal([]);

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(10000);

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
      });

    expect(followed_links).to.deep.equal([]);

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(10000);

  it('Exits early with generic_result when options cannot be parsed', async () => {
    const server = getTestServer('BrokenLinksInvalidOptionsNotOk');

    // invoke SyntheticBrokenLinks with SuperTest
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
  }).timeout(10000);

  it('Runs a failing Broken Links suite', async () => {
    const server = getTestServer('BrokenLinksFailingOk');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const origin_uri = `file:${path.join(
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

    expect(broken_links_result?.link_count).to.equal(3);
    expect(broken_links_result?.passing_link_count).to.equal(2);
    expect(broken_links_result?.failing_link_count).to.equal(1);
    expect(broken_links_result?.unreachable_count).to.equal(1);
    expect(broken_links_result?.status2xx_count).to.equal(2);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    expect(options).to.deep.equal({
      origin_uri: origin_uri,
      link_limit: 10,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      link_order:
        BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
      link_timeout_millis: 30000,
      max_retries: 0,
      wait_for_selector: '',
      per_link_options: {},
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
      });

    const sorted_followed_links = followed_links?.sort((a, b) =>
      a.target_uri.localeCompare(b.target_uri)
    );

    const doesnt_exist_path = `file://${path.join(
      __dirname,
      '../example_html_files/file_doesnt_exist.html'
    )}`
      .split(' ')
      .join('%20');
    expect(sorted_followed_links)
      .excluding(['target_uri', 'link_start_time', 'link_end_time'])
      .to.deep.equal([
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
          expected_status_code: { status_class: 200 },
          source_uri: origin_uri,
          target_uri: 'CHECKED_BELOW',
          html_element: 'img',
          anchor_text: '',
          error_type: 'Error',
          error_message: 'net::ERR_FILE_NOT_FOUND at ' + doesnt_exist_path,
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        },
      ]);

    const expectedTargetPaths = [
      'example_html_files/200.html',
      'example_html_files/file_doesnt_exist.html',
    ];
    followed_links?.forEach((link, index) => {
      expect(link.target_uri.endsWith(expectedTargetPaths[index]));
    });

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(10000);

  it('Runs a passing Broken Links suite', async () => {
    const server = getTestServer('BrokenLinksPassingOk');

    // invoke SyntheticBrokenLinks with SuperTest
    const response = await supertest(server)
      .get('/')
      .send()
      .set('Content-Type', 'application/json')
      .expect(200);

    const origin_uri = `file:${path.join(
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

    expect(broken_links_result?.link_count).to.equal(2);
    expect(broken_links_result?.passing_link_count).to.equal(2);
    expect(broken_links_result?.failing_link_count).to.equal(0);
    expect(broken_links_result?.unreachable_count).to.equal(0);
    expect(broken_links_result?.status2xx_count).to.equal(2);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    expect(options).to.deep.equal({
      origin_uri: origin_uri,
      link_limit: 10,
      query_selector_all: 'a[src]',
      get_attributes: ['src'],
      link_order:
        BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
      link_timeout_millis: 30000,
      max_retries: 0,
      wait_for_selector: '',
      per_link_options: {},
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
      });

    expect(followed_links)
      .excluding(['target_uri', 'link_start_time', 'link_end_time'])
      .to.deep.equal([
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
      ]);

    const expectedTargetPaths = ['example_html_files/200.html'];
    followed_links?.forEach((link, index) => {
      expect(link.target_uri.endsWith(expectedTargetPaths[index]));
    });

    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-api']).to.not.be
      .undefined;
    expect(runtime_metadata?.['@google-cloud/synthetics-sdk-broken-links']).to
      .not.be.undefined;
  }).timeout(10000);
});
