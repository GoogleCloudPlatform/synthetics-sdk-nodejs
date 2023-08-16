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
} from './link_utils';

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
 *   - `response`: HTTP response or error if navigation fails, or null.
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
): Promise<{
  response: HTTPResponse | Error | null;
  passed: boolean;
  retriesRemaining: number;
  link_start_time: string;
  link_end_time: string;
}> {
  let link_start_time = '';
  let link_end_time = '';
  let retriesRemaining = options.max_retries!;
  const per_link_timeout_millis =
    options.per_link_options[options.origin_url]?.link_timeout_millis ||
    options.link_timeout_millis!;

  let response: HTTPResponse | Error | null = null;

  let passed = false;
  let used_retry = false;
  while (retriesRemaining > 0 && !passed) {
    retriesRemaining--;
    link_start_time = new Date().toISOString();
    response = await fetchLink(page, link.target_url, per_link_timeout_millis);
    link_end_time = new Date().toISOString();

    // prevents errors caused by navigating from one url to same url with a
    // different anchor part (normally returns null)
    // e.g. mywebsite.com#heading1 --> mywebsite.com#heading2
    if (response === null && !used_retry) {
      link_start_time = new Date().toISOString();
      await page.goto('about:blank');
      response = await fetchLink(
        page,
        link.target_url,
        per_link_timeout_millis
      );
      used_retry = !used_retry;
      link_end_time = new Date().toISOString();
    }

    if (
      isHTTPResponse(response) &&
      checkStatusPassing(expected_status_code, response.status())
    ) {
      passed = true;
      break;
    }
  }
  return { response, passed, retriesRemaining, link_start_time, link_end_time };
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
): Promise<HTTPResponse | Error | null> {
  try {
    const response = await page.goto(target_url, {
      waitUntil: 'load',
      timeout: timeout,
    });
    return response;
  } catch (err) {
    if (err instanceof Error) return err;
    return null;
  }
}
