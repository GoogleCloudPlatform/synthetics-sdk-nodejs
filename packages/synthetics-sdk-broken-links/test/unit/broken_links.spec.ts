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
import { expect, use } from 'chai';
import chaiExclude from 'chai-exclude';
use(chaiExclude);
const path = require('path');
import sinon from 'sinon';

// Internal Project Files
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_CaptureCondition as ApiCaptureCondition,
  BrokenLinksResultV1_SyntheticLinkResult,
  BrokenLinksResultV1_SyntheticLinkResult_ScreenshotOutput as ApiScreenshotOutput,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  runBrokenLinks,
  BrokenLinkCheckerOptions,
  CaptureCondition,
} from '../../src/broken_links';

// External Dependencies
const proxyquire = require('proxyquire');
import { Page } from 'puppeteer';
import { Bucket, Storage } from '@google-cloud/storage';

const TEST_BUCKET_NAME = 'gcm-test-project-id-synthetics-test-region';

describe('runBrokenLinks', async () => {
  const status_class_2xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  const defaultScreenshotOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions =
    {
      capture_condition: ApiCaptureCondition.FAILING,
      storage_location: '',
    };
  const emptyScreenshotOutput: ApiScreenshotOutput = {
    screenshot_file: '',
    screenshot_error: {} as BaseError,
  };
  const successfulScreenshotOuput: ApiScreenshotOutput = {
    screenshot_file: 'bucket/folder/file.png',
    screenshot_error: {} as BaseError,
  };
  const args = { checkId: 'test-check-id', executionId: 'test-execution-id' };

  const mockedstorageFunc = proxyquire('../../src/storage_func', {
    '@google-cloud/synthetics-sdk-api': {
      getExecutionRegion: () => 'test-region',
      resolveProjectId: () => 'test-project-id',
    },
  });

  const mockedNavigationFunc = proxyquire('../../src/navigation_func', {
    './storage_func': {
      uploadScreenshotToGCS: () => successfulScreenshotOuput,
    },
  });

  let storageClientStub: sinon.SinonStubbedInstance<Storage>;
  let bucketStub: sinon.SinonStubbedInstance<Bucket>;
  let pageStub: sinon.SinonStubbedInstance<Page>;
  beforeEach(() => {
    // Stub a storage bucket
    bucketStub = sinon.createStubInstance(Bucket);
    bucketStub.name = TEST_BUCKET_NAME;
    bucketStub.create.resolves([bucketStub]);
    // Simulate default_bucket not existing initially
    bucketStub.exists.resolves([false]); // Simulate the bucket not existing initially

    // Stub the storage client
    storageClientStub = sinon.createStubInstance(Storage);
    storageClientStub.bucket.returns(bucketStub);

    // Stub a puppeteer page to return set Buffer when .screenshot() called
    pageStub = sinon.createStubInstance(Page);
    pageStub.screenshot.resolves(Buffer.from('screenshot-image-data', 'utf-8'));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Exits early when options cannot be parsed', async () => {
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_uri: 'uri-does-not-start-with-http',
    };

    const result = await runBrokenLinks(inputOptions, args);

    const genericResult = result.synthetic_generic_result_v1;

    expect(genericResult).to.be.exist;
    expect(genericResult?.ok).to.be.false;
    expect(genericResult?.generic_error?.error_type).to.equal('Error');
    expect(genericResult?.generic_error?.error_message).to.equal(
      'origin_uri must be a string that starts with `http://` or `https://`'
    );
  }).timeout(15000);

  it('returns broken_links_result with origin link failure when waitForSelector exceeds deadline', async () => {
    const mockedBlc = proxyquire('../../src/broken_links', {
      './storage_func': {
        ...mockedstorageFunc,
        createStorageClientIfStorageSelected: () => storageClientStub,
      },
      './navigation_func': {
        ...mockedNavigationFunc,
      },
    });

    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      wait_for_selector: 'not_present',
      link_timeout_millis: 3001,
      screenshot_options: { capture_condition: CaptureCondition.NONE },
    };

    const result = await mockedBlc.runBrokenLinks(inputOptions, args);

    const broken_links_result = result?.synthetic_broken_links_result_v1;
    const origin_link = broken_links_result?.origin_link_result;

    expect(broken_links_result?.followed_link_results).to.be.empty;
    expect(origin_link?.link_passed).to.be.false;
    expect(origin_link?.error_type).to.equal('TimeoutError');
    expect(origin_link?.error_message).to.equal(
      'Waiting for selector `not_present` failed: Waiting failed: 3001ms exceeded'
    );
  }).timeout(15000);

  it('Global timeout occurs during checkOriginLink waiting for `wait_for_selector', async () => {
    const mockedBlc = proxyquire('../../src/broken_links', {
      './storage_func': {
        ...mockedstorageFunc,
        createStorageClientIfStorageSelected: () => storageClientStub,
      },
      './navigation_func': {
        ...mockedNavigationFunc,
      },
    });

    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      wait_for_selector: 'none existent',
      link_timeout_millis: 35000,
      total_synthetic_timeout_millis: 31000,
      screenshot_options: { capture_condition: CaptureCondition.NONE },
    };
    const result = await mockedBlc.runBrokenLinks(inputOptions, args);
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
        "Total Synthetic Timeout of 31000 milliseconds hit while waiting for selector 'none existent'",
      link_start_time: 'NA',
      link_end_time: 'NA',
      is_origin: true,
      screenshot_output: emptyScreenshotOutput,
    };

    expect(broken_links_result?.origin_link_result)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal(expectedOriginLinkResult);
    expect(broken_links_result?.followed_link_results.length).to.equal(0);
  }).timeout(40000);

  it('Handles error when trying to visit page that does not exist', async () => {
    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/file_doesnt_exist.html'
    )}`;
    const inputOptions: BrokenLinkCheckerOptions = {
      origin_uri: origin_uri,
      screenshot_options: { capture_condition: CaptureCondition.NONE },
    };

    const result = await runBrokenLinks(inputOptions, args);

    const broken_links_result = result?.synthetic_broken_links_result_v1;
    const origin_link = broken_links_result?.origin_link_result;
    const followed_links = broken_links_result?.followed_link_results;

    expect(result.start_time).to.be.a.string;
    expect(result.end_time).to.be.a.string;

    expect(broken_links_result?.link_count).to.equal(1);
    expect(broken_links_result?.passing_link_count).to.equal(0);
    expect(broken_links_result?.failing_link_count).to.equal(1);
    expect(broken_links_result?.unreachable_count).to.equal(1);
    expect(broken_links_result?.status2xx_count).to.equal(0);
    expect(broken_links_result?.status3xx_count).to.equal(0);
    expect(broken_links_result?.status4xx_count).to.equal(0);
    expect(broken_links_result?.status5xx_count).to.equal(0);

    expect(origin_link)
      .excluding(['link_start_time', 'link_end_time'])
      .to.deep.equal({
        link_passed: false,
        expected_status_code: status_class_2xx,
        source_uri: origin_uri,
        target_uri: origin_uri,
        html_element: '',
        anchor_text: '',
        status_code: undefined,
        error_type: 'Error',
        error_message: 'net::ERR_FILE_NOT_FOUND at ' + origin_uri,
        link_start_time: 'NA',
        link_end_time: 'NA',
        is_origin: true,
        screenshot_output: emptyScreenshotOutput,
      });

    expect(followed_links).to.deep.equal([]);
  }).timeout(10000);

  it('Completes a full failing execution (1 failing link)', async () => {
    const mockedBlc = proxyquire('../../src/broken_links', {
      './storage_func': {
        ...mockedstorageFunc,
        createStorageClientIfStorageSelected: () => storageClientStub,
      },
      './navigation_func': {
        ...mockedNavigationFunc,
      },
    });

    const origin_uri = `file:${path.join(
      __dirname,
      '../example_html_files/retrieve_links_test.html'
    )}`;
    const inputOptions = {
      origin_uri: origin_uri,
      query_selector_all: 'a[src], img[href]',
      get_attributes: ['href', 'src'],
      wait_for_selector: '',
      screenshot_options: {
        capture_condition: CaptureCondition.FAILING,
      },
    };

    const result = await mockedBlc.runBrokenLinks(inputOptions, args);

    const broken_links_result = result?.synthetic_broken_links_result_v1;
    const options = broken_links_result?.options;
    const origin_link = broken_links_result?.origin_link_result;
    const followed_links = broken_links_result?.followed_link_results;

    expect(result.start_time).to.be.a.string;
    expect(result.end_time).to.be.a.string;

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
      total_synthetic_timeout_millis: 60000,
      screenshot_options: defaultScreenshotOptions,
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
        screenshot_output: emptyScreenshotOutput,
      });

    const sorted_followed_links = followed_links?.sort(
      (
        a: BrokenLinksResultV1_SyntheticLinkResult,
        b: BrokenLinksResultV1_SyntheticLinkResult
      ) => a.target_uri.localeCompare(b.target_uri)
    );

    const fileDoesntExistPath = `file://${path.join(
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
          screenshot_output: emptyScreenshotOutput,
        },
        {
          link_passed: false,
          expected_status_code: { status_class: 200 },
          source_uri: origin_uri,
          target_uri: 'CHECKED_BELOW',
          html_element: 'img',
          anchor_text: '',
          status_code: undefined,
          error_type: 'Error',
          error_message: 'net::ERR_FILE_NOT_FOUND at ' + fileDoesntExistPath,
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
          screenshot_output: successfulScreenshotOuput,
        },
      ]);

    // these are checked separately because path and puppeteer format space differently which cause the equality assertion to fail
    const expectedTargeturis = [
      '/example_html_files/200.html',
      '/example_html_files/file_doesnt_exist.html',
    ];
    broken_links_result?.followed_link_results?.forEach(
      (link: BrokenLinksResultV1_SyntheticLinkResult, index: number) => {
        expect(link.target_uri.endsWith(expectedTargeturis[index]));
      }
    );
  }).timeout(150000);
});
