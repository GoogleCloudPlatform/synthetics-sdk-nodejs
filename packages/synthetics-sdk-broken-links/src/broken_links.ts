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
  getRuntimeMetadata,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import {
  checkStatusPassing,
  isHTTPResponse,
  LinkIntermediate,
  shouldGoToBlankPage,
  setDefaultOptions,
  NavigateResponse,
  CommonResponseProps,
  createSyntheticResult,
} from './link_utils';

export interface BrokenLinkCheckerOptions {
  origin_url: string;
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
  'FIRST_N',
  'RANDOM',
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

/* c8 ignore start */
export async function runBrokenLinks(
  input_options: BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // init
  const start_time = new Date().toISOString();
  const runtime_metadata = getRuntimeMetadata();

  // TODO validate input_options

  // options object modified directly
  const options = setDefaultOptions(input_options);

  // create Browser & origin page then navigate to origin_url, w/ origin
  // specific settings
  const browser = await puppeteer.launch({ headless: 'new' });
  const origin_page = await browser.newPage();

  // TODO check origin_link

  if (options.wait_for_selector) {
    // TODO set timeout here to be timeout - time from checking origin link above
    await origin_page.waitForSelector(options.wait_for_selector);
  }

  // TODO
  // scrape origin_url for all links
  try {
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const retrieved_links: LinkIntermediate[] = await retrieveLinksFromPage(
      origin_page,
      options.query_selector_all,
      options.get_attributes
    );

    // TODO shuffle links if link_order is `RANDOM`
    // TODO always truncate to lint_limit
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
    // TODO throw generic error with `failure to scrape links`
  }

  // TODO
  // create new page to be used for all scraped links
  // navigate to each link - LOOP:
  //          each call to `checkLink(...)` will return a `SyntheticLinkResult`
  //          Object added to an array of `followed_links`
  const followed_links: BrokenLinksResultV1_SyntheticLinkResult[] = [];

  // returned a SyntheticResult with `options`, `followed_links` &
  // runtimeMetadata
  return createSyntheticResult(
    start_time,
    runtime_metadata,
    options,
    followed_links
  );
}
/* c8 ignore stop */

/**
 * Retrieves all links on the page using Puppeteer, handling relative and
 * protocol-relative links and filtering for HTTP/HTTPS links.
 *
 * @param page - The Puppeteer page instance to retrieve the links from.
 * @param query_selector_all - The CSS selector to identify link elements.
 * @param get_attributes - An array of attribute names to retrieve from the link elements.
 * @returns An array of LinkIntermediate objects representing the links found.
 */
export async function retrieveLinksFromPage(
  page: Page,
  query_selector_all: string,
  get_attributes: string[]
): Promise<LinkIntermediate[]> {
  const origin_url = await page.url();
  // `page.evaluate()` runs in a different context, isolated from main Node.js,
  // so c8 is not able to track coverage.
  /* c8 ignore start */
  return await page.evaluate(
    (
      query_selector_all: string,
      get_attributes: string[],
      origin_url: string
    ) => {
      const link_elements: HTMLElement[] = Array.from(
        document.querySelectorAll(query_selector_all)
      );
      return link_elements.flatMap((link_element: HTMLElement) => {
        const anchor_text = link_element?.textContent?.trim() ?? '';

        return get_attributes
          .map((attr) => (link_element.getAttribute(attr) || '').toString())
          .filter((value) => {
            const qualifed_url = new URL(value, origin_url);
            return value && qualifed_url.href.startsWith('http');
          })
          .map((value) => {
            const qualifed_url = new URL(value, origin_url);
            return {
              target_url: qualifed_url.href,
              anchor_text: anchor_text,
              html_element: link_element.tagName.toLocaleLowerCase(),
            };
          });
      });
    },
    query_selector_all,
    get_attributes,
    origin_url
  );
  /* c8 ignore stop */
}

/**
 * Checks the status of a link and returns a synthetic link result.
 *
 * @param page - The Puppeteer Page instance to use for navigation.
 * @param link - The link.target_url to check
 * @param options - global options object with all broken link checker options.
 * @param isOrigin=false - Indicates if the link is the origin URL.
 *
 * @returns A promise that resolves to a SyntheticLinkResult with all info
 *          required by api spec.
 */
/* c8 ignore start */
export async function checkLink(
  page: Page,
  link: LinkIntermediate,
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions,
  isOrigin = false
): Promise<BrokenLinksResultV1_SyntheticLinkResult> {
  // Determine the expected status code for the link, using per-link setting if
  // available, else use default 2xx class
  const expectedStatusCode: ResponseStatusCode = options.per_link_options[
    link.target_url
  ]?.expected_status_code ?? {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };

  // Perform the navigation and retrieves info to return
  const {
    responseOrError,
    passed,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    retriesRemaining,
    linkStartTime,
    linkEndTime,
  } = await navigate(page, link, options, expectedStatusCode);

  // Initialize variables for error information
  let errorType = '';
  let errorMessage = '';

  if (responseOrError instanceof Error) {
    errorType = responseOrError.name;
    errorMessage = responseOrError.message;
  } else if (!passed) {
    // The link did not pass and no Puppeteer Error was thrown, manually set
    // error information
    errorType = 'BrokenLinksSynthetic_IncorrectStatusCode';

    const classOrCode = expectedStatusCode.status_class ? 'class' : 'code';
    const expectedStatus =
      expectedStatusCode.status_class ?? expectedStatusCode.status_value;

    errorMessage =
      `${link?.target_url} returned status code ` +
      `${responseOrError?.status()} when a ${expectedStatus} status ` +
      `${classOrCode} was expected.`;
  }

  const response = isHTTPResponse(responseOrError)
    ? (responseOrError as HTTPResponse)
    : null;

  return {
    link_passed: passed,
    expected_status_code: expectedStatusCode,
    origin_url: options.origin_url,
    target_url: link.target_url,
    html_element: link.html_element,
    anchor_text: link.anchor_text,
    status_code: response?.status(),
    error_type: errorType,
    error_message: errorMessage,
    link_start_time: linkStartTime,
    link_end_time: linkEndTime,
    is_origin: isOrigin,
  };
}
/* c8 ignore stop */

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
  let fetch_link_output = {} as CommonResponseProps;
  let retriesRemaining = options.max_retries! + 1;
  // use link_specific timeout if set, else use options.link_timeout_millis
  const per_link_timeout_millis =
    options.per_link_options[link.target_url]?.link_timeout_millis ??
    options.link_timeout_millis!;

  // see function description for why this is necessary
  if (shouldGoToBlankPage(await page.url(), link.target_url)) {
    await page.goto('about:blank');
  }

  let passed = false;
  /**
   * Expected behavior: if the link fails for any reason, see
   * fetch_link_output.responseOrError, we should retry the entire process (i.e.
   *  `fetch_link`). This is a product decision in case users are dealing with
   * network jitters or other conditions. If any of these tries are successful,
   * we do not need to check again that link again.
   * Note: Default behavior is to check a link only once!
   */
  while (retriesRemaining > 0 && !passed) {
    retriesRemaining--;
    fetch_link_output = await fetchLink(
      page,
      link.target_url,
      per_link_timeout_millis
    );

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
    linkStartTime: fetch_link_output.linkStartTime,
    linkEndTime: fetch_link_output.linkEndTime,
  };
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
): Promise<CommonResponseProps> {
  let responseOrError: HTTPResponse | Error | null;
  const linkStartTime = new Date().toISOString();

  try {
    responseOrError = await page.goto(target_url, {
      waitUntil: 'load',
      timeout: timeout,
    });
  } catch (err) {
    responseOrError = err instanceof Error ? err : null;
  }

  const linkEndTime = new Date().toISOString();
  return { responseOrError, linkStartTime, linkEndTime };
}
