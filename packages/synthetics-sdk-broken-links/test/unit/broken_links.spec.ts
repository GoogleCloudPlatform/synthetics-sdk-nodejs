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
import { BrokenLinksResultV1_BrokenLinkCheckerOptions } from '@google-cloud/synthetics-sdk-api';
import { setDefaultOptions } from '../../src/link_utils';
const SyntheticsSdkBrokenLinks = require('synthetics-sdk-broken-links');

describe('GCM Synthetics Broken Links Core Functionality', async () => {
  describe('navigate', async () => {
    // constants
    const link = { target_url: 'https://example.com' };
    const options: BrokenLinksResultV1_BrokenLinkCheckerOptions = {
      origin_url: 'http://origin.com',
      max_retries: 3,
      link_timeout_millis: 5000,
    } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
    setDefaultOptions(options);

    const failedResponse: Partial<HTTPResponse> = { status: () => 404 };
    const successfulResponse: Partial<HTTPResponse> = { status: () => 200 };

    // Puppeteer constants
    let browser: Browser;
    let page: Page;
    before(async () => {
      browser = await puppeteer.launch({
        // executablePath: process.env.PUPPETEER_EXEC_PATH, // maybe change to `/usr/bin/google-chrome`
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
      const result = await SyntheticsSdkBrokenLinks.navigate(
        page,
        link,
        options
      );

      expect(result.passed).to.be.true;
      expect(result.responseOrError.status()).to.equal(200);
      expect(result.retriesRemaining).to.equal(2);

      // Assert that link_start_time is less than link_end_time
      const startTime = new Date(result.link_start_time).getTime();
      const endTime = new Date(result.link_end_time).getTime();
      expect(startTime).to.be.lessThan(endTime);
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

      const result = await SyntheticsSdkBrokenLinks.navigate(
        pageStub,
        link,
        options
      );

      expect(result.passed).to.be.true;
      expect(result.responseOrError.status()).to.equal(200);
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

      const result = await SyntheticsSdkBrokenLinks.navigate(
        pageStub,
        link,
        options
      );

      expect(result.passed).to.be.false;
      expect(result.responseOrError.status()).to.equal(404);
      expect(result.retriesRemaining).to.equal(0);
    });

    it('should catch and return an TimeoutError after maximum retries', async () => {
      // set timeout
      const options_with_timeout = Object.assign({}, options);
      options_with_timeout.link_timeout_millis = 1;

      const result = await SyntheticsSdkBrokenLinks.navigate(
        page,
        link,
        options_with_timeout
      );

      expect(result.passed).to.be.false;
      expect(result.retriesRemaining).to.equal(0);

      // response is a `TimeoutError
      expect(result.responseOrError.name).to.equal('TimeoutError');
      expect(result.responseOrError.message).to.equal(
        'Navigation timeout of 1 ms exceeded'
      );

      // not `HTTPResponse`
      expect(result.responseOrError.status).to.be.undefined;
    });

    it('with `shouldGoToBlankPage` navigation works on first try', async () => {
      // placeholder
      page.setCacheEnabled(false);
      await page.goto('https://pptr.dev/');
      link.target_url = 'https://pptr.dev/#';

      const result = await SyntheticsSdkBrokenLinks.navigate(
        page,
        link,
        options
      );

      expect(result.retriesRemaining).to.equal(2);
      expect(result.responseOrError.status()).to.equal(200);
    });
  });
});
