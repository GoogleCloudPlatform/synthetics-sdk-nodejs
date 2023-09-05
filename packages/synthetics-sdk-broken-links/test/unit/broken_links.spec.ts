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

import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import {
  BrokenLinksResultV1,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import { LinkIntermediate, setDefaultOptions } from '../../src/link_utils';
import {
  BrokenLinkCheckerOptions,
  checkLink,
  navigate,
  retrieveLinksFromPage,
  runBrokenLinks,
} from '../../src/broken_links';
import { prototype } from 'events';
const path = require('path');

describe('GCM Synthetics Broken Links Core Functionality', async () => {
  describe('puppeteer complete navigation & api spec response ', async () => {
    // constants
    const link: LinkIntermediate = {
      target_url: 'https://example.com',
      anchor_text: '',
      html_element: '',
    };
    const input_options: BrokenLinkCheckerOptions = {
      origin_url: 'http://origin.com',
      max_retries: 2,
      link_timeout_millis: 5000,
    };
    const options = setDefaultOptions(input_options);

    const response4xx: Partial<HTTPResponse> = { status: () => 404 };
    const response2xx: Partial<HTTPResponse> = { status: () => 200 };
    const status_class_2xx: ResponseStatusCode = {
      status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
    };
    const status_class_4xx: ResponseStatusCode = {
      status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_4XX,
    };

    // Puppeteer constants
    let browser: Browser;
    let page: Page;
    before(async () => {
      browser = await puppeteer.launch({
        headless: 'new',
      });
    });

    beforeEach(async () => {
      // Create a new page for each test
      page = await browser.newPage();
      page.setCacheEnabled(false);
    });

    after(async () => {
      // Close the browser after all tests
      await browser.close();
    });

    describe('navigate', async () => {
      it('should pass after retries', async () => {
        const pageStub = sinon.createStubInstance(Page);
        pageStub.url.returns('fake-current-url');

        // Configure the stub to simulate a failed navigation on the first call
        // and a successful one on the second
        pageStub.goto
          .onFirstCall()
          .resolves(response4xx as HTTPResponse)
          .onSecondCall()
          .resolves(response2xx as HTTPResponse);

        const result = await navigate(pageStub, link, options);

        expect(result.passed).to.be.true;
        expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
        expect(result.retriesRemaining).to.equal(1);
      });

      it('should fail after maximum retries', async () => {
        const pageStub = sinon.createStubInstance(Page);
        pageStub.url.returns('fake-current-url');

        // Configure the stub to simulate a failed navigation on three
        // consecutive calls
        pageStub.goto
          .onFirstCall()
          .resolves(response4xx as HTTPResponse)
          .onSecondCall()
          .resolves(response4xx as HTTPResponse)
          .onThirdCall()
          .resolves(response4xx as HTTPResponse);

        const result = await navigate(pageStub, link, options);

        expect(result.passed).to.be.false;
        expect((result.responseOrError as HTTPResponse).status()).to.equal(404);
        expect(result.retriesRemaining).to.equal(0);
      });

      it('with `shouldGoToBlankPage` navigation works on first try', async () => {
        await page.goto('https://pptr.dev/');
        const puppeteer_link: LinkIntermediate = {
          target_url: 'https://pptr.dev/#',
          anchor_text: '',
          html_element: '',
        };
        const result = await navigate(page, puppeteer_link, options);

        expect(result.passed).to.be.true;
        expect(result.responseOrError).to.be.an.instanceOf(HTTPResponse);
        expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
        expect(result.retriesRemaining).to.equal(2);
      }).timeout(2500);
    });

    describe('checkLink', async () => {
      it('passes when navigating to real url', async () => {
        const synLinkResult = await checkLink(page, link, options);

        const expectations: BrokenLinksResultV1_SyntheticLinkResult = {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: 'http://origin.com',
          target_url: 'https://example.com',
          html_element: '',
          anchor_text: '',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        };

        expect(synLinkResult)
          .excluding(['link_start_time', 'link_end_time'])
          .deep.equal(expectations);

        // Assert that link_start_time is less than link_end_time
        const startTime = new Date(synLinkResult.link_start_time).getTime();
        const endTime = new Date(synLinkResult.link_end_time).getTime();
        expect(startTime).to.be.lessThan(endTime);
      });

      it('passes when navigating to .json', async () => {
        const json_link: LinkIntermediate = {
          target_url: `file:${path.join(
            __dirname,
            '../example_test_files/jokes.json'
          )}`,
          anchor_text: '',
          html_element: '',
        };
        const synLinkResult = await checkLink(page, json_link, options);

        const expectations: BrokenLinksResultV1_SyntheticLinkResult = {
          link_passed: true,
          expected_status_code: status_class_2xx,
          origin_url: 'http://origin.com',
          target_url: `file:${path.join(
            __dirname,
            '../example_test_files/jokes.json'
          )}`,
          html_element: '',
          anchor_text: '',
          status_code: 200,
          error_type: '',
          error_message: '',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        };

        expect(synLinkResult)
          .excluding(['link_start_time', 'link_end_time'])
          .deep.equal(expectations);
      });

      it('catches and returns a TimeoutError', async () => {
        // set timeout
        const options_with_timeout = Object.assign({}, options);
        options_with_timeout.link_timeout_millis = 1;

        const timeout_link: LinkIntermediate = {
          target_url: 'https://example.com',
          anchor_text: "Hello I'm an example",
          html_element: 'img',
        };

        const synLinkResult = await checkLink(
          page,
          timeout_link,
          options_with_timeout
        );

        const expectations: BrokenLinksResultV1_SyntheticLinkResult = {
          link_passed: false,
          expected_status_code: status_class_2xx,
          origin_url: 'http://origin.com',
          target_url: 'https://example.com',
          html_element: 'img',
          anchor_text: "Hello I'm an example",
          status_code: undefined,
          error_type: 'TimeoutError',
          error_message: 'Navigation timeout of 1 ms exceeded',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        };

        expect(synLinkResult)
          .excluding(['link_start_time', 'link_end_time'])
          .deep.equal(expectations);
      });

      it('returns error when the actual response code does not match the expected', async () => {
        // add expected 404 status to options of broken link checker
        const optionsExp404 = Object.assign({}, options);
        const per_link_expected_404 = {
          expected_status_code: {
            status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_4XX,
          },
          link_timeout_millis: options.link_timeout_millis,
        };
        optionsExp404.per_link_options['https://expecting404.com'] =
          per_link_expected_404;

        // LinkIntermediate that will be navigated to
        const timeoutLink: LinkIntermediate = {
          target_url: 'https://expecting404.com',
          anchor_text: 'return 404',
          html_element: 'a',
        };

        const pageStub = sinon.createStubInstance(Page);
        pageStub.goto
          .onFirstCall()
          .resolves(response2xx as HTTPResponse)
          .onSecondCall()
          .resolves(response2xx as HTTPResponse)
          .onThirdCall()
          .resolves(response2xx as HTTPResponse);

        const synLinkResult = await checkLink(
          pageStub,
          timeoutLink,
          optionsExp404
        );

        const expectations: BrokenLinksResultV1_SyntheticLinkResult = {
          link_passed: false,
          expected_status_code: status_class_4xx,
          origin_url: 'http://origin.com',
          target_url: 'https://expecting404.com',
          html_element: 'a',
          anchor_text: 'return 404',
          status_code: 200,
          error_type: 'BrokenLinksSynthetic_IncorrectStatusCode',
          error_message:
            'https://expecting404.com returned status code 200 when a 400 status class was expected.',
          link_start_time: 'NA',
          link_end_time: 'NA',
          is_origin: false,
        };

        expect(synLinkResult)
          .excluding(['link_start_time', 'link_end_time'])
          .deep.equal(expectations);
      });
    });
  });

  describe('retrieveLinksFromPage', async () => {
    // Puppeteer constants
    let browser: Browser;
    let page: Page;
    let pageUrlStub: sinon.SinonStub<[], string>;
    before(async () => {
      browser = await puppeteer.launch({ headless: 'new' });
    });

    beforeEach(async () => {
      // Create a new page for each test
      page = await browser.newPage();
      await page.goto(
        `file:${path.join(
          __dirname,
          '../example_test_files/retrieve_links_test.html'
        )}`
      );
      // Mock page.url() to return a custom URL
      pageUrlStub = sinon.stub(page, 'url').returns('https://mocked.com');
    });

    after(async () => {
      // Close the browser after all tests
      pageUrlStub.restore();
      await browser.close();
    });

    it('correctly finds links using inputs, does not return `mailto:` link ', async () => {
      const query_selector_all = 'img, a';
      const get_attributes = ['href', 'src'];

      const results = await retrieveLinksFromPage(
        page,
        query_selector_all,
        get_attributes
      );

      const expectations: LinkIntermediate[] = [
        {
          // Fully qualified external link
          target_url: 'https://www.example.com/',
          anchor_text: 'External Link',
          html_element: 'a',
        },
        {
          // Internal Relative Link
          target_url: 'https://mocked.com/about',
          anchor_text: 'Internal Relative Link',
          html_element: 'a',
        },
        {
          // Protocol-Relative Link
          target_url: 'https://example.com/protocol-relative',
          anchor_text: 'Protocol-Relative Link',
          html_element: 'a',
        },
        {
          // Anchor Link (Just #)
          target_url: 'https://mocked.com/#',
          anchor_text: 'Anchor Link (Just #)',
          html_element: 'a',
        },
        {
          // Image with src attribute
          target_url: 'https://www.example.com/image.jpg',
          anchor_text: '',
          html_element: 'img',
        },
        {
          // Image with href attribute
          target_url: 'https://mocked.com/relative-link-img-href',
          anchor_text: '',
          html_element: 'img',
        },
      ];

      // note: does not return `mailto:...` link
      expect(results).to.deep.equal(expectations);
    });

    it('handles complicated query_selector_all', async () => {
      const query_selector_all = 'img[href], a[src]';
      const get_attributes = ['href', 'src'];

      const results = await retrieveLinksFromPage(
        page,
        query_selector_all,
        get_attributes
      );

      const expectations: LinkIntermediate[] = [
        {
          target_url: 'https://www.example.com/',
          anchor_text: 'External Link',
          html_element: 'a',
        },
        {
          target_url: 'https://mocked.com/relative-link-img-href',
          anchor_text: '',
          html_element: 'img',
        },
      ];

      expect(results).to.deep.equal(expectations);
    });

    it('returns no links if improperly configured', async () => {
      const query_selector_all = 'link, script';
      const get_attributes = ['alt'];

      const results = await retrieveLinksFromPage(
        page,
        query_selector_all,
        get_attributes
      );

      const expectations: LinkIntermediate[] = [];
      expect(results).to.deep.equal(expectations);
    });
  });
});

describe.only('runBrokenLinks', async () => {
  const status_class_2xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  it('should complete succesfully', async () => {
    const origin_url = `file:${path.join(
      __dirname,
      '../example_test_files/retrieve_links_test.html'
    )}`;
    // Create a stub for puppeteer.launch to simulate launching a browser
    const inputOptions = {
      origin_url: origin_url,
      query_selector_all: 'a[src], img',
      get_attributes: ['href', 'src'],
      BLAHHHH_INPUT: 98989,
    };

    // Create a stub for retrieveLinksFromPage
    const validateInputOptionsStub = sinon
      .stub()
      .returns({
        origin_url: origin_url,
        query_selector_all: 'a[src], img',
        get_attributes: ['href', 'src'],
      });

    // Configure proxyquire
    const runBrokenLinksMod = proxyquire('../../src/broken_links', {
      './link_utils': {
        validateInputOptions: validateInputOptionsStub,
      },
      './broken_links': {
        runBrokenLinks: runBrokenLinks
      }
    });

    const result = await runBrokenLinksMod.runBrokenLinks(inputOptions);

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

    // TODO figure out how to bipass the validity check!!
  }).timeout(300000);
});
