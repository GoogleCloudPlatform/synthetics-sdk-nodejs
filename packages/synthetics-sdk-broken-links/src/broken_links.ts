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

import puppeteer, { Browser, Page } from 'puppeteer';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_SyntheticLinkResult,
  instantiateMetadata,
  getRuntimeMetadata,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import {
  createSyntheticResult,
  getGenericSyntheticResult,
  LinkIntermediate,
  shuffleAndTruncate,
} from './link_utils';
import {
  checkLink,
  checkLinks,
  closeBrowser,
  closePagePool,
  retrieveLinksFromPage,
  openNewPage,
} from './navigation_func';
import { setDefaultOptions, validateInputOptions } from './options_func';

export interface BrokenLinkCheckerOptions {
  origin_uri: string;
  link_limit?: number;
  query_selector_all?: string;
  get_attributes?: string[];
  link_order?: LinkOrder;
  link_timeout_millis?: number | undefined;
  max_retries?: number | undefined;
  max_redirects?: number | undefined;
  wait_for_selector?: string;
  per_link_options?: { [key: string]: PerLinkOption };
}

export interface PerLinkOption {
  link_timeout_millis?: number;
  expected_status_code?: StatusClass | number;
}

export enum LinkOrder {
  FIRST_N = 'FIRST_N',
  RANDOM = 'RANDOM',
}

export enum StatusClass {
  STATUS_CLASS_UNSPECIFIED = 'STATUS_CLASS_UNSPECIFIED',
  STATUS_CLASS_1XX = 'STATUS_CLASS_1XX',
  STATUS_CLASS_2XX = 'STATUS_CLASS_2XX',
  STATUS_CLASS_3XX = 'STATUS_CLASS_3XX',
  STATUS_CLASS_4XX = 'STATUS_CLASS_4XX',
  STATUS_CLASS_5XX = 'STATUS_CLASS_5XX',
  STATUS_CLASS_ANY = 'STATUS_CLASS_ANY',
}

const synthetics_sdk_broken_links_package = require('../package.json');
instantiateMetadata(synthetics_sdk_broken_links_package);

export async function runBrokenLinks(
  inputOptions: BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // init
  const startTime = new Date().toISOString();
  const runtime_metadata = getRuntimeMetadata();

  let browser: Browser;
  try {
    const options = processOptions(inputOptions);

    // create Browser & origin page then navigate to origin_uri, w/ origin
    // specific settings
    browser = await puppeteer.launch({ headless: 'new' });
    const originPage = await openNewPage(browser);

    const followed_links = [await checkOriginLink(originPage, options)];
    // if orgin link did not pass exit and return the singular link result
    if (!followed_links[0].link_passed) {
      return createSyntheticResult(
        startTime,
        runtime_metadata,
        options,
        followed_links
      );
    }

    // scrape and organize links to check
    const linksToFollow: LinkIntermediate[] = await scrapeLinks(
      originPage,
      options
    );

    // check all links
    followed_links.push(...(await checkLinks(browser, linksToFollow, options)));

    // returned a SyntheticResult with `options`, `followed_links` &
    // runtimeMetadata
    return createSyntheticResult(
      startTime,
      runtime_metadata,
      options,
      followed_links
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : `An error occurred while starting or running the broken link checker on ${inputOptions.origin_uri}. Please reference server logs for further information.`;
    return getGenericSyntheticResult(startTime, errorMessage);
  } finally {
    if (browser! !== undefined) {
      await closeBrowser(browser);
      await closePagePool(await browser.pages());
    }
  }
}

/**
 * Checks the origin link (waits for wait_for_selector) and returns the result.
 *
 * @param originPage - The Puppeteer page object representing the origin page.
 * @param options - The broken link checker options.
 * @returns The result of checking the origin link.
 */
async function checkOriginLink(
  originPage: Page,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<BrokenLinksResultV1_SyntheticLinkResult> {
  // check origin_link
  const originLinkResult = await checkLink(
    originPage,
    { target_uri: options.origin_uri, anchor_text: '', html_element: '' },
    options,
    true
  );

  try {
    if (options.wait_for_selector) {
      await originPage.waitForSelector(options.wait_for_selector, {
        timeout: options.link_timeout_millis,
      });
    }
  } catch (err) {
    originLinkResult.link_passed = false;
    if (err instanceof Error) {
      originLinkResult.error_type = err.name;
      originLinkResult.error_message = err.message;
      process.stderr.write(err.message);
    }
  }

  return originLinkResult;
}

/**
 * Scrapes links from the origin page and returns them.
 * If applicable:
 *     - wait for `options.wait_for_selector` element before scraping.
 *     - shuffle and truncate based on `options`
 *
 * @param originPage - The Puppeteer page object representing the origin page.
 * @param options - The broken link checker options.
 * @returns An array of scraped links in accordance with link_limit and link_order.
 */
async function scrapeLinks(
  originPage: Page,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<LinkIntermediate[]> {
  // scrape links on originUri
  const retrievedLinks: LinkIntermediate[] = await retrieveLinksFromPage(
    originPage,
    options.query_selector_all,
    options.get_attributes
  );

  return shuffleAndTruncate(
    retrievedLinks,
    options.link_limit!,
    options.link_order
  );
}

/**
 * Validates input options and sets defaults in `options`.
 *
 * @param inputOptions - The input options for the broken link checker.
 * @returns The processed broken link checker options.
 */
function processOptions(
  inputOptions: BrokenLinkCheckerOptions
): BrokenLinksResultV1_BrokenLinkCheckerOptions {
  const validOptions = validateInputOptions(inputOptions);
  return setDefaultOptions(validOptions);
}
