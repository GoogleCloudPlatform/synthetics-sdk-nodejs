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

import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_SyntheticLinkResult,
  getRuntimeMetadata,
  BrokenLinksResultV1,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
  instantiateMetadata,
  GenericResultV1,
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
  openNewPage
} from './link_utils';
import { link } from 'fs';

// should I just export BrokenLinksResultV1_BrokenLinkCheckerOptions
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

const synthetics_sdk_broken_links_package = require('../package.json');
instantiateMetadata(synthetics_sdk_broken_links_package);

const getGenericError = (genericErrorMessage: string): GenericResultV1 => ({
  ok: false,
  generic_error: {
    error_type: 'Error',
    error_message: genericErrorMessage,
    function_name: '',
    file_path: '',
    line: 0,
  },
});

const getGenericSyntheticResult = (
  startTime: string,
  genericErrorMessage: string
): SyntheticResult => ({
  synthetic_generic_result_v1: getGenericError(genericErrorMessage),
  runtime_metadata: getRuntimeMetadata(),
  start_time: startTime,
  end_time: new Date().toISOString(),
});

export async function runBrokenLinks(
  input_options: BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // init
  const startTime = new Date().toISOString();
  const runtime_metadata = getRuntimeMetadata();

  // TODO validate input_options

  // options object modified directly
  const options = setDefaultOptions(input_options);

  let browser: Browser;
  let originPage: Page;
  const followed_links: BrokenLinksResultV1_SyntheticLinkResult[] = [];
  try {
    // create Browser & origin page then navigate to origin_url, w/ origin
    // specific settings
    browser = await puppeteer.launch({ headless: 'new' });
    originPage = await browser.newPage();

    // check origin_link
    const originLinkResult = await checkLink(
      originPage,
      { target_url: options.origin_url, anchor_text: '', html_element: '' },
      options,
      true
    );
    followed_links.push(originLinkResult);
    // if orgin link did not pass exit and return the singular link result
    if (!originLinkResult.link_passed) {
      return createSyntheticResult(
        startTime,
        runtime_metadata,
        options,
        followed_links
      );
    }

    if (options.wait_for_selector) {
      // TODO set timeout here to be timeout - time from checking origin link above
      await originPage.waitForSelector(options.wait_for_selector);
    }
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
    return getGenericSyntheticResult(
      startTime,
      `An error occurred while loading or checking ${options.origin_url}. Please reference server logs for further information.`
    );
  }

  const links_to_follow: LinkIntermediate[] = [];
  try {
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const retrieved_links: LinkIntermediate[] = await retrieveLinksFromPage(
      originPage,
      options.query_selector_all,
      options.get_attributes
    );

    // shuffle links if link_order is `RANDOM`
    options.link_order ===
    BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM
      ? links_to_follow.push(...retrieved_links.sort(() => Math.random() - 0.5))
      : links_to_follow.push(...retrieved_links);
    // always truncate to lint_limit
    links_to_follow.splice(options.link_limit! - 1);
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
    return getGenericSyntheticResult(
      startTime,
      `An error occurred while scraping ${options.origin_url}. Please reference server logs for further information.`
    );
  }

  try {
    const page = await openNewPage(browser);

    followed_links.push(...(await checkLinks(page, links_to_follow, options)));
  } catch (err) {
    let errorMessage =
      'An error occured while checking scraped links. Please reference server logs for further information.';
    if (err instanceof Error) errorMessage = err.message;
    return getGenericSyntheticResult(startTime, errorMessage);
  }

  try {
    await browser.close();
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
    // if this step fails we do not need to fail the entire execution
  }

  return createSyntheticResult(
    startTime,
    runtime_metadata,
    options,
    followed_links
  );
}

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
}

async function checkLinks(
  page: Page,
  links: LinkIntermediate[],
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<BrokenLinksResultV1_SyntheticLinkResult[]> {
  const followed_links: BrokenLinksResultV1_SyntheticLinkResult[] = [];
  for (const link of links) {
    try {
      followed_links.push(await checkLink(page, link, options));
    } catch (err) {
      if (err instanceof Error) process.stderr.write(err.message);
      throw new Error(
        `An error occurred while checking ${link}. Please reference server logs for further information.`
      );
    }
  }
  return followed_links;
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

export function parseFollowedLinks(
  followed_links: BrokenLinksResultV1_SyntheticLinkResult[]
) {
  const broken_links_result: BrokenLinksResultV1 = {
    link_count: 0,
    passing_link_count: 0,
    failing_link_count: 0,
    unreachable_count: 0,
    status_2xx_count: 0,
    status_3xx_count: 0,
    status_4xx_count: 0,
    status_5xx_count: 0,
    options: {} as BrokenLinksResultV1_BrokenLinkCheckerOptions,
    origin_link_result: {} as BrokenLinksResultV1_SyntheticLinkResult,
    followed_link_results: [],
  };

  for (const link of followed_links) {
    link.is_origin
      ? (broken_links_result.origin_link_result = link)
      : broken_links_result.followed_link_results.push(link);

    broken_links_result.link_count = (broken_links_result.link_count ?? 0) + 1;

    link.link_passed === true
      ? (broken_links_result.passing_link_count =
          (broken_links_result.passing_link_count ?? 0) + 1)
      : (broken_links_result.failing_link_count =
          (broken_links_result.failing_link_count ?? 0) + 1);

    if (!link.link_passed) {
      console.log('failed: ', link);
    }

    switch (Math.floor(link.status_code! / 100)) {
      case 2:
        broken_links_result.status_2xx_count =
          (broken_links_result.status_2xx_count ?? 0) + 1;
        break;

      case 3:
        broken_links_result.status_3xx_count =
          (broken_links_result.status_3xx_count ?? 0) + 1;
        break;

      case 4:
        broken_links_result.status_4xx_count =
          (broken_links_result.status_4xx_count ?? 0) + 1;
        break;

      case 5:
        broken_links_result.status_5xx_count =
          (broken_links_result.status_5xx_count ?? 0) + 1;
        break;

      default:
        // Handle other status codes if needed
        broken_links_result.unreachable_count =
          (broken_links_result.unreachable_count ?? 0) + 1;
        break;
    }
  }

  return broken_links_result;
}
