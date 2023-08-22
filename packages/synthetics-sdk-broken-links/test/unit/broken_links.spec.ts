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

import { expect } from 'chai';
import puppeteer, { Page, Browser, HTTPResponse } from 'puppeteer';
import sinon from 'sinon';
const path = require('path');
import { LinkIntermediate, setDefaultOptions } from '../../src/link_utils';
import {
  BrokenLinkCheckerOptions,
  navigate,
  retrieveLinksFromPage,
} from '../../src/broken_links';

describe('GCM Synthetics Broken Links Core Functionality', async () => {
  describe('navigate', async () => {
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

    const failedResponse: Partial<HTTPResponse> = { status: () => 404 };
    const successfulResponse: Partial<HTTPResponse> = { status: () => 200 };

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
    });

    after(async () => {
      // Close the browser after all tests
      await browser.close();
    });

    it('should pass on the first attempt', async () => {
      // Navigation to "https://example.com" should pass on the first attempt
      const result = await navigate(page, link, options);

      expect(result.passed).to.be.true;
      expect(result.responseOrError).to.be.an.instanceOf(HTTPResponse);
      expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
      expect(result.retriesRemaining).to.equal(2);

      // Assert that link_start_time is less than link_end_time
      const startTime = new Date(result.link_start_time).getTime();
      const endTime = new Date(result.link_end_time).getTime();
      expect(startTime).to.be.lessThan(endTime);
    });

    it('passes when navigating to .json', async () => {
      const json_link : LinkIntermediate = {
        target_url: link.target_url = `file:${path.join(
          __dirname,
          '../example_test_files/jokes.json'
        )}`,
        anchor_text: '',
        html_element: '',
      }
      const result = await navigate(page, json_link, options);

      expect(result.passed).to.be.true;
      expect(result.responseOrError).to.be.an.instanceOf(HTTPResponse);
      expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
      expect(result.retriesRemaining).to.equal(2);
    });

    it('should pass after retries', async () => {
      const pageStub = sinon.createStubInstance(Page);

      // Configure the stub to simulate a failed navigation on the first call
      // and a successful one on the second
      pageStub.goto
        .onFirstCall()
        .resolves(failedResponse as HTTPResponse)
        .onSecondCall()
        .resolves(successfulResponse as HTTPResponse);

      const result = await navigate(pageStub, link, options);

      expect(result.passed).to.be.true;
      expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
      expect(result.retriesRemaining).to.equal(1);
    });

    it('should fail after maximum retries', async () => {
      const pageStub = sinon.createStubInstance(Page);

      // Configure the stub to simulate a failed navigation on three consecutive
      // calls
      pageStub.goto
        .onFirstCall()
        .resolves(failedResponse as HTTPResponse)
        .onSecondCall()
        .resolves(failedResponse as HTTPResponse)
        .onThirdCall()
        .resolves(failedResponse as HTTPResponse);

      const result = await navigate(pageStub, link, options);

      expect(result.passed).to.be.false;
      expect((result.responseOrError as HTTPResponse).status()).to.equal(404);
      expect(result.retriesRemaining).to.equal(0);
    });

    it('should catch and return an TimeoutError after maximum retries', async () => {
      // set timeout
      const options_with_timeout = Object.assign({}, options);
      options_with_timeout.link_timeout_millis = 1;

      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { link_start_time, link_end_time, ...result } = await navigate(
        page,
        link,
        options_with_timeout
      );

      // response is a `TimeoutError`
      const error = new Error('Navigation timeout of 1 ms exceeded');
      error.name = 'TimeoutError';
      expect(result).to.deep.equal({
        passed: false,
        retriesRemaining: 0,
        responseOrError: error,
      });
    });

    it('with `shouldGoToBlankPage` navigation works on first try', async () => {
      // placeholder
      page.setCacheEnabled(false);
      await page.goto('https://pptr.dev/');
      link.target_url = 'https://pptr.dev/#';

      const result = await navigate(page, link, options);

      expect(result.passed).to.be.true;
      expect(result.responseOrError).to.be.an.instanceOf(HTTPResponse);
      expect((result.responseOrError as HTTPResponse).status()).to.equal(200);
      expect(result.retriesRemaining).to.equal(2);
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
