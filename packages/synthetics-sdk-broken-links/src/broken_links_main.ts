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

import puppeteer from 'puppeteer';
import {
  getRuntimeMetadata,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import {
  closeBrowser,
  createSyntheticResult,
  LinkIntermediate,
  openNewPage,
  setDefaultOptions,
  shuffleAndTruncate,
  validateInputOptions,
} from './link_utils';
import {
  BrokenLinkCheckerOptions,
  checkLink,
  checkLinks,
  retrieveLinksFromPage,
  getGenericSyntheticResult,
} from './broken_links_func';

export async function runBrokenLinks(
  inputOptions: BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // init
  const startTime = new Date().toISOString();
  const runtime_metadata = getRuntimeMetadata();

  try {
    // validate inputOptions and set defaults in `options`
    const validOptions = validateInputOptions(inputOptions);
    const options = setDefaultOptions(validOptions);

    // create Browser & origin page then navigate to origin_url, w/ origin
    // specific settings
    const browser = await puppeteer.launch({ headless: 'new' });
    const originPage = await browser.newPage();

    // check origin_link
    const originLinkResult = await checkLink(
      originPage,
      { target_url: options.origin_url, anchor_text: '', html_element: '' },
      options,
      true
    );
    const followed_links = [originLinkResult];
    // if orgin link did not pass exit and return the singular link result
    if (!originLinkResult.link_passed) {
      await closeBrowser(browser);
      return createSyntheticResult(
        startTime,
        runtime_metadata,
        options,
        followed_links
      );
    }

    if (options.wait_for_selector) {
      await originPage.waitForSelector(options.wait_for_selector);
    }

    // scrape links on originUrl
    const retrievedLinks: LinkIntermediate[] = await retrieveLinksFromPage(
      originPage,
      options.query_selector_all,
      options.get_attributes
    );

    const linksToFollow = shuffleAndTruncate(
      retrievedLinks,
      options.link_limit!,
      options.link_order
    );

    // create new page to be used for all scraped links
    const page = await openNewPage(browser);
    // check all links
    followed_links.push(...(await checkLinks(page, linksToFollow, options)));

    await closeBrowser(browser);

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
        : `An error occurred while starting or running the broken link checker on ${inputOptions.origin_url}. Please reference server logs for further information.`;
    return getGenericSyntheticResult(startTime, errorMessage);
  }
}
