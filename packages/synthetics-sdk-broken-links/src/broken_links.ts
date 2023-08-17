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

import puppeteer, { HTTPResponse, Page } from 'puppeteer';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import {
  checkStatusPassing,
  isHTTPResponse,
  LinkIntermediate,
  setDefaultOptions,
  NavigateResponse,
  FetchLinkResponse,
} from './link_utils';
import { should } from 'chai';

export async function runBrokenLinks(
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // START - to resolve warnings while under development
  options;
  checkStatusPassing({ status_value: 200 } as ResponseStatusCode, 200);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await checkLink(
    page,
    {} as LinkIntermediate,
    {} as BrokenLinksResultV1_BrokenLinkCheckerOptions
  );
  // END - to resolve warnings  while under development

  // options object modified directly
  setDefaultOptions(options);

  // PSEUDOCODE

  // create puppeteer.Browser
  // create puppeteer.Page & navigate to origin_url, w/ origin specific settings

  // scrape origin_url for all links
  // (shuffle links if necessary and) truncate at link_limit

  // create new page to be used for all scraped links
  // navigate to each link - LOOP:
  //          each call to `checkLinks(...)` will return a `SyntheticLinkResult`
  //          Object added to an array of `followed_links`

  // returned a SyntheticResult with `options`, `followed_links` &
  // runtimeMetadata
  return {} as SyntheticResult;
}

async function checkLink(
  page: Page,
  link: LinkIntermediate,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<BrokenLinksResultV1_SyntheticLinkResult> {
  // START - to resolve warnings while under development
  page;
  link;
  options;
  // END - to resolve warnings  while under development

  // PSEUDOCODE

  // determine expected_status_code—determined here rather than `navigate(...)`
  // since it will be used later when creating
  // `BrokenLinksResultV1_SyntheticLinkResult` Object

  // call `navigate(...)`
  /**
   * const {
   *    response: responseOrError,
   *    passed,
   *    testing_only,
   *    link_start_time,
   *    link_end_time,
   * } = await navigate(page, link, expected_status_code, options);
   */

  // Error handling based on `responseOrError` & passed:
  //    if      `responseOrError` is type `Error` set `error_type` and
  //            `error_message` in `SyntheticLinkResult` accordingly
  //    else if `passed === false`. Set error `SYNTHETIC_INCORRECT_STATUS_CODE`

  // return `SynheticLinkResult` with all calculated information
  return {} as BrokenLinksResultV1_SyntheticLinkResult;
}

/**
 * Navigates to a target URL with retries and timeout handling.
 *
 * @param page - The Puppeteer Page instance.
 * @param link - The LinkIntermediate containing the target URL.
 * @param expected_status_code - The expected HTTP status code.
 * @param options - The options for navigation and retries.
 * @returns Information about navigation attempt:
 *   - `responseOrError`: HTTP response or error if navigation fails, or null.
 *   - `passed`: Boolean indicating if navigation passed per status code.
 *   - `retriesRemaining`: Remaining retries after attempt. (for testing)
 *   - `link_start_time`: Start time of navigation attempt.
 *   - `link_end_time`: End time of navigation attempt.
 */
export async function navigate(
  page: Page,
  link: LinkIntermediate,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions,
  expected_status_code: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  }
): Promise<NavigateResponse> {
  let fetch_link_output = {} as FetchLinkResponse;
  let retriesRemaining = options.max_retries!;
  // use link_specific timeout if set, else use options.link_timeout_millis
  const per_link_timeout_millis =
    options.per_link_options[link.target_url]?.link_timeout_millis ||
    options.link_timeout_millis!;

  let passed = false;
  let used_anchor_retry = false;
  while (retriesRemaining > 0 && !passed) {
    retriesRemaining--;
    fetch_link_output = await fetchLink(
      page,
      link.target_url,
      per_link_timeout_millis
    );

    // // prevents errors caused by navigating from one url to same url with a
    // // different anchor part (normally returns null)
    // // e.g. mywebsite.com#heading1 --> mywebsite.com#heading2
    // if (fetch_link_output.responseOrError === null && !used_anchor_retry) {
    //   await page.goto('about:blank');
    //   fetch_link_output = await fetchLink(
    //     page,
    //     link.target_url,
    //     per_link_timeout_millis
    //   );
    //   used_anchor_retry = true;
    // }

    if (shouldGoToBlankPage(page.url(), link.target_url)) {
      await page.goto('about:blank');
    }

    passed =
      isHTTPResponse(fetch_link_output.responseOrError) &&
      checkStatusPassing(
        expected_status_code,
        fetch_link_output.responseOrError.status()
      );
  }
  return {
    responseOrError: fetch_link_output.responseOrError,
    passed: passed,
    retriesRemaining: retriesRemaining,
    link_start_time: fetch_link_output.link_start_time,
    link_end_time: fetch_link_output.link_end_time,
  };
}

// should be in link_utils.
// prevents errors caused by navigating from one url to same url with a
// different anchor part (normally returns null)
// e.g. mywebsite.com#heading1 --> mywebsite.com#heading2
function shouldGoToBlankPage(current_url: string, target_url: string): boolean {
  return (
    target_url.includes('#') &&
    current_url.includes(target_url.substring(0, target_url.indexOf('#')))
  );
}

/**
 * Fetches the target URL using Puppeteer's page.goto method.
 *
 * @param page - The Puppeteer Page instance.
 * @param target_url - The URL to navigate to.
 * @param timeout - The timeout for the navigation.
 * @returns The HTTP response, an error if navigation fails, or null if no response.
 */
async function fetchLink(
  page: Page,
  target_url: string,
  timeout: number
): Promise<FetchLinkResponse> {
  let responseOrError: HTTPResponse | Error | null;
  const link_start_time = new Date().toISOString();

  try {
    responseOrError = await page.goto(target_url, {
      waitUntil: 'load',
      timeout: timeout,
    });
  } catch (err) {
    responseOrError = err instanceof Error ? err : null;
  }

  const link_end_time = new Date().toISOString();
  return { responseOrError, link_start_time, link_end_time };
}
