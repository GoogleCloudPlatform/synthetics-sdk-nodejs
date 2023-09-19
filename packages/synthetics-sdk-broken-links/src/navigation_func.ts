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

import { Browser, HTTPRequest, HTTPResponse, Page } from 'puppeteer';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  checkStatusPassing,
  CommonResponseProps,
  isHTTPResponse,
  LinkIntermediate,
  NavigateResponse,
  shouldGoToBlankPage,
} from './link_utils';

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
  const origin_uri = await page.url();
  return await page.evaluate(
    (
      query_selector_all: string,
      get_attributes: string[],
      origin_uri: string
    ) => {
      const link_elements: HTMLElement[] = Array.from(
        document.querySelectorAll(query_selector_all)
      );
      return link_elements.flatMap((link_element: HTMLElement) => {
        const anchor_text = link_element?.textContent?.trim() ?? '';

        return get_attributes
          .map((attr) => (link_element.getAttribute(attr) || '').toString())
          .filter((value) => {
            const qualifed_url = new URL(value, origin_uri).href;
            return (
              value &&
              (qualifed_url.startsWith('http') ||
                qualifed_url.startsWith('file:'))
            );
          })
          .map((value) => {
            const qualifed_url = value.startsWith('file:')
              ? value
              : new URL(value, origin_uri).href;
            return {
              target_uri: qualifed_url,
              anchor_text: anchor_text,
              html_element: link_element.tagName.toLocaleLowerCase(),
            };
          });
      });
    },
    query_selector_all,
    get_attributes,
    origin_uri
  );
}

/**
 * Concurrently checks a list of links on multiple Puppeteer pages, records the results,
 * and throws a detailed error if necessary.
 *
 * @param browser - The Puppeteer browser instance used to create pages.
 * @param links - An array of links to check.
 * @param options - global options object with all broken link checker options.
 * @returns A Promise that resolves with an array of successfully checked link
 *          results
 * @throws {Error} If an error occurs while checking the links, it throws an
 *          error with an appropriate message, including which link errored.
 */
export async function checkLinks(
  browser: Browser,
  links: LinkIntermediate[],
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<BrokenLinksResultV1_SyntheticLinkResult[]> {
  const followed_links: BrokenLinksResultV1_SyntheticLinkResult[] = [];
  for (const link of links) {
    try {
      const page = await openNewPage(browser);
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
 * @param link - The link.target_uri to check
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
    link.target_uri
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
      `${link?.target_uri} returned status code ` +
      `${responseOrError?.status()} when a ${expectedStatus} status ` +
      `${classOrCode} was expected.`;
  }

  const response = isHTTPResponse(responseOrError)
    ? (responseOrError as HTTPResponse)
    : undefined;

  return {
    link_passed: passed,
    expected_status_code: expectedStatusCode,
    source_uri: options.origin_uri,
    target_uri: link.target_uri,
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
 * @param options - global options object with all broken link checker options.
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
    options.per_link_options[link.target_uri]?.link_timeout_millis ??
    options.link_timeout_millis!;

  // see function description for why this is necessary
  if (shouldGoToBlankPage(await page.url(), link.target_uri)) {
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
      link.target_uri,
      per_link_timeout_millis,
      options.max_redirects!
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
 * @param target_uri - The URL to navigate to.
 * @param timeout - The timeout for the navigation.
 * @returns The HTTP response, an error if navigation fails, or null if no response.
 */
async function fetchLink(
  page: Page,
  target_uri: string,
  timeout: number,
  max_redirects: number
): Promise<CommonResponseProps> {
  let responseOrError: HTTPResponse | Error | null;
  const linkStartTime = new Date().toISOString();

  try {
    // Enable request interception.
    await page.setRequestInterception(true);

    // Intercept requests and follow redirects until the maximum number of redirects is reached.
    page.on('request', async (request) => {
      await handleNavigationRequestWithRedirects(request, max_redirects);
    });

    responseOrError = await page.goto(target_uri, {
      waitUntil: 'load',
      timeout: timeout,
    });
  } catch (err) {
    responseOrError = err instanceof Error ? err : null;
  } finally {
    // Disable request interception.
    await page.setRequestInterception(false);
  }

  const linkEndTime = new Date().toISOString();
  return { responseOrError, linkStartTime, linkEndTime };
}

/**
 * Handles navigation requests and follows redirects until the maximum number of redirects is reached.
 *
 * @param {Request} request - The intercepted request.
 * @param {number} max_redirects - The maximum number of redirects allowed.
 */
export async function handleNavigationRequestWithRedirects(
  request: HTTPRequest,
  max_redirects: number
) {
  let followedRedirects = 0;

  if (request.isNavigationRequest()) {
    if (followedRedirects > max_redirects) {
      // If max_redirects is exceeded, abort the request
      return await request.abort();
    } else {
      // If max_redirects is not exceeded, continue the request
      followedRedirects++;
    }
  }
  return await request.continue();
}

/**
 * Closes the provided Puppeteer pages handles any errors
 * gracefully. No error is thrown as even if this errors we do not need to fail
 * the entire execution as Cloud Functions will handle the cleanup.
 *
 * @param browser - The Puppeteer browser instance to close.
 */
export async function closePagePool(pagePool: Page[]) {
  try {
    // Close all pages in the pool
    await Promise.all(pagePool.map(async (page) => await page.close()));
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
  }
}

/**
 * Opens a new Puppeteer page within the provided browser instance, disables caching, and returns the created page.
 *
 * @param browser - The Puppeteer browser instance in which to open a new page.
 * @returns A Promise that resolves with the newly created Puppeteer page or
 *          rejects if an error occurs during page creation.
 * @throws {Error} If an error occurs while opening a new page, it throws an
 *                 error with an appropriate message.
 */
export async function openNewPage(browser: Browser) {
  try {
    const page = await browser.newPage();
    page.setCacheEnabled(false);
    return page;
  } catch (pageError) {
    if (pageError instanceof Error) process.stderr.write(pageError.message);
    throw new Error('An error occurred while opening a new puppeteer.Page.');
  }
}

/**
 * Closes the provided Puppeteer browser instance and handles any errors
 * gracefully. No error is thrown as even if this errors we do not need to fail
 * the entire execution as Cloud Functions will handle the cleanup.
 *
 * @param browser - The Puppeteer browser instance to close.
 */
export async function closeBrowser(browser: Browser) {
  try {
    await browser.close();
  } catch (err) {
    if (err instanceof Error) process.stderr.write(err.message);
  }
}
