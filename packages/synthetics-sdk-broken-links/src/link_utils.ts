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

import { Browser, HTTPResponse } from 'puppeteer';
import {
  BrokenLinksResultV1,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import {
  BrokenLinkCheckerOptions,
  LinkOrder,
  StatusClass,
} from './broken_links';

/**
 * Represents an intermediate link with its properties.
 */
export interface LinkIntermediate {
  /**
   * The target URL of the link.
   */
  target_url: string;

  /**
   * The anchor text of the link.
   */
  anchor_text: string;

  /**
   * The HTML element of the link.
   */
  html_element: string;
}

/**
 * Represents common response properties for navigation (currently:`fetchLink()`
 *  and `navigate()`)
 */
export interface CommonResponseProps {
  /**
   * The response or error received during navigation. Essentially a wrapper
   * around `page.goto()`.
   */
  responseOrError: HTTPResponse | Error | null;

  /**
   * The start time of the link navigation.
   */
  linkStartTime: string;

  /**
   * The end time of the link navigation.
   */
  linkEndTime: string;
}

/**
 * Represents the response from a navigation attempt (currently: `navigate()`)
 */
export interface NavigateResponse extends CommonResponseProps {
  /**
   * Indicates whether the link passed successfully (taking into account per
   * link options, if present).
   */
  passed: boolean;

  /**
   * The number of navigation retries remaining for the link.
   */
  retriesRemaining: number;
}

/**
 * Checks if the given status code is passing w.r.t. expected status class or
 * code
 *
 * @param expected - The expected status code.
 * @param actual - The actual status code.
 * @returns Whether the status code is passing.
 */
export function checkStatusPassing(
  expected: ResponseStatusCode,
  actual: number
): boolean {
  if (typeof expected?.status_value === 'number') {
    return expected?.status_value === actual;
  } else {
    switch (expected?.status_class) {
      case ResponseStatusCode_StatusClass.STATUS_CLASS_1XX:
        return actual >= 100 && actual <= 199;
      case ResponseStatusCode_StatusClass.STATUS_CLASS_2XX:
        return actual >= 200 && actual <= 299;
      case ResponseStatusCode_StatusClass.STATUS_CLASS_3XX:
        return actual >= 300 && actual <= 399;
      case ResponseStatusCode_StatusClass.STATUS_CLASS_4XX:
        return actual >= 400 && actual <= 499;
      case ResponseStatusCode_StatusClass.STATUS_CLASS_5XX:
        return actual >= 500 && actual <= 599;
      default:
        return false;
    }
  }
}

/**
 * Validates the input options for the Broken Link Checker.
 *
 * @param inputOptions - The input options to be validated.
 * @returns The sanitized input options if validation passes.
 * @throws {Error} If any of the input options fail validation.
 */
export function validateInputOptions(
  inputOptions: BrokenLinkCheckerOptions
): BrokenLinkCheckerOptions {
  if (!inputOptions.origin_url) {
    throw new Error('Missing origin_url in options');
  } else if (
    typeof inputOptions.origin_url !== 'string' ||
    (!inputOptions.origin_url.startsWith('http') &&
      !inputOptions.origin_url.endsWith('.html'))
  ) {
    throw new Error('origin_url must be a string that starts with `http`');
  }

  // check link_limit
  if (
    inputOptions.link_limit !== undefined &&
    (typeof inputOptions.link_limit !== 'number' || inputOptions.link_limit < 1)
  ) {
    throw new Error(
      'Invalid link_limit value, must be a number greater than 0'
    );
  }

  // check query_selector_all
  if (
    inputOptions.query_selector_all !== undefined &&
    (typeof inputOptions.query_selector_all !== 'string' ||
      inputOptions.query_selector_all.length === 0)
  ) {
    throw new Error(
      'Invalid query_selector_all value, must be a non-empty string'
    );
  }

  // check get_attributes
  if (
    inputOptions.get_attributes &&
    (!Array.isArray(inputOptions.get_attributes) ||
      !inputOptions.get_attributes.every((item) => typeof item === 'string'))
  ) {
    throw new Error(
      'Invalid get_attributes value, must be an array of only strings'
    );
  }

  // check link_order
  if (
    inputOptions.link_order !== undefined &&
    !Object.values(LinkOrder).includes(inputOptions.link_order)
  ) {
    throw new Error('Invalid link_order value, must be `FIRST_N` or `RANDOM`');
  }

  // check link_timeout_millis
  if (
    inputOptions.link_timeout_millis !== undefined &&
    (typeof inputOptions.link_timeout_millis !== 'number' ||
      inputOptions.link_timeout_millis < 1)
  ) {
    throw new Error(
      'Invalid link_timeout_millis value, must be a number greater than 0'
    );
  }

  // check max_retries
  if (
    inputOptions.max_retries !== undefined &&
    (typeof inputOptions.max_retries !== 'number' ||
      inputOptions.max_retries < 0)
  ) {
    throw new Error(
      'Invalid max_retries value, must be a number greater than -1'
    );
  }

  // check max_redirects
  if (
    inputOptions.max_redirects !== undefined &&
    (typeof inputOptions.max_redirects !== 'number' ||
      inputOptions.max_redirects < 0)
  ) {
    throw new Error(
      'Invalid max_redirects value, must be a number greater than -1'
    );
  }

  // Check wait_for_selector
  if (
    inputOptions.wait_for_selector !== undefined &&
    (typeof inputOptions.wait_for_selector !== 'string' ||
      inputOptions.wait_for_selector.length === 0)
  ) {
    throw new Error(
      'Invalid wait_for_selector value, must be a non-empty string'
    );
  }

  // per_link_options
  for (const [key, value] of Object.entries(
    inputOptions.per_link_options || {}
  )) {
    // Check URL in per_link_options
    if (!key.startsWith('http')) {
      throw new Error(
        'Invalid url in per_link_options, urls must start with `http`'
      );
    }

    // Check link_timeout_millis in per_link_options
    if (
      value.link_timeout_millis !== undefined &&
      (typeof inputOptions.link_timeout_millis !== 'number' ||
        inputOptions.link_timeout_millis < 1)
    ) {
      throw new Error(
        `Invalid link_timeout_millis value in per_link_options set for ${key}, must be a number greater than 0`
      );
    }

    // Check expected_status_code in per_link_options
    if (
      value.expected_status_code !== undefined &&
      (typeof value.expected_status_code !== 'number' ||
        value.expected_status_code < 100 ||
        value.expected_status_code > 599) &&
      !Object.values(StatusClass).includes(
        value.expected_status_code as StatusClass
      )
    ) {
      throw new Error(
        `Invalid expected_status_code in per_link_options for ${key}, must be a number between 100 and 599 (inclusive) or a string present in StatusClass enum`
      );
    }
  }

  // do this to remove out any extra fields
  return {
    origin_url: inputOptions.origin_url,
    link_limit: inputOptions.link_limit,
    query_selector_all: inputOptions.query_selector_all,
    get_attributes: inputOptions.get_attributes,
    link_order: inputOptions.link_order,
    link_timeout_millis: inputOptions.link_timeout_millis,
    max_retries: inputOptions.max_retries,
    max_redirects: inputOptions.max_redirects,
    wait_for_selector: inputOptions.wait_for_selector,
    per_link_options: inputOptions.per_link_options,
  };
}

/**
 * Sets default values for the given options object, filling in missing
 * properties with default values.
 *
 * @param options - The options object to be filled with default values.
 */
export function setDefaultOptions(
  inputOptions: BrokenLinkCheckerOptions
): BrokenLinksResultV1_BrokenLinkCheckerOptions {
  const defaulOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions = {
    origin_url: '',
    link_limit: 50,
    query_selector_all: 'a',
    get_attributes: ['href'],
    link_order: BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N,
    link_timeout_millis: 30000,
    max_retries: 0,
    max_redirects: Number.MAX_SAFE_INTEGER, // allows infinite number of redirects
    wait_for_selector: '',
    per_link_options: {},
  };

  const outputOptions: BrokenLinksResultV1_BrokenLinkCheckerOptions =
    {} as BrokenLinksResultV1_BrokenLinkCheckerOptions;

  const optionsKeys = Object.keys(defaulOptions) as Array<
    keyof BrokenLinksResultV1_BrokenLinkCheckerOptions
  >;
  for (const optionName of optionsKeys) {
    // per_link_options and linkorder are handled below
    if (optionName === 'per_link_options' || optionName === 'link_order')
      continue;

    if (
      !(optionName in inputOptions) ||
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (inputOptions as any)[optionName] === undefined
    ) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (outputOptions as any)[optionName] = defaulOptions[optionName];
    } else {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (outputOptions as any)[optionName] = inputOptions[optionName];
    }
  }

  // converting inputOptions.link_order, type: LinkOrder to
  // outputOptions.link_order, type BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder
  if (inputOptions.link_order) {
    outputOptions.link_order =
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder[
        inputOptions.link_order
      ];
  } else {
    outputOptions.link_order = defaulOptions.link_order;
  }

  // Convert `inputOptions.per_link_options`, type: {[key: string]: PerLinkOption}
  // to `outputOptions.per_links_options`, type: {[key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption}
  const perLinkOptions: {
    [key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption;
  } = {};
  for (const [url, perLinkOption] of Object.entries(
    inputOptions.per_link_options || {}
  )) {
    const expected_status_code = inputExpectedStatusToResponseStatusCode(
      perLinkOption.expected_status_code
    );

    const convertedPerLinkOption: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption =
      {
        expected_status_code: expected_status_code,
        link_timeout_millis:
          perLinkOption.link_timeout_millis ||
          outputOptions.link_timeout_millis,
      };
    perLinkOptions[url] = convertedPerLinkOption;
  }
  outputOptions.per_link_options = perLinkOptions;
  return outputOptions;
}

/**
 * Converts a `PerLinkOption.expected_status_code` object into a
 * `ResponseStatusCode` object.
 *
 * @param perLinkOption - The `PerLinkOption` to be converted ()
 * @returns The converted `ResponseStatusCode` object.
 */
function inputExpectedStatusToResponseStatusCode(
  input_expected_status_code: number | StatusClass | undefined
): ResponseStatusCode {
  let output_expected_status_code;
  if (input_expected_status_code !== undefined) {
    if (typeof input_expected_status_code === 'number') {
      output_expected_status_code = {
        status_value: input_expected_status_code,
      };
    } else {
      output_expected_status_code = {
        status_class:
          ResponseStatusCode_StatusClass[input_expected_status_code],
      };
    }
  } else {
    output_expected_status_code = {
      status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
    };
  }
  return output_expected_status_code as ResponseStatusCode;
}

/**
 * Type guard function to check if an object is an instance of HTTPResponse.
 *
 * @param response - The object to be checked.
 * @returns `true` if the object is an instance of HTTPResponse, `false` otherwise.
 */
export function isHTTPResponse(
  response: HTTPResponse | Error | null
): response is HTTPResponse {
  return (
    response !== null && typeof response === 'object' && 'status' in response
  );
}

/**
 * Determines whether navigating from the current URL to the target URL
 * requires navigating to a blank page. This prevents Puppeteer errors caused by
 * navigating from one URL to the same URL with a different anchor part (will
 * normally return `null`).
 *
 * @param current_url - The current URL in the browser.
 * @param target_url - The target URL
 * @returns True if navigating requires a blank page, false otherwise.
 * @example
 * const currentUrl = 'http://example.com/page1#section1';
 * const targetUrl = 'http://example.com/page1#section2';
 * const needsBlankPage = shouldGoToBlankPage(currentUrl, targetUrl); // true
 */
export function shouldGoToBlankPage(
  current_url: string,
  target_url: string
): boolean {
  // Check if the target URL contains an anchor (#) and if the current URL
  // includes the same base URL (excluding the anchor part)
  return (
    target_url.includes('#') &&
    current_url.includes(target_url.substring(0, target_url.indexOf('#')))
  );
}

/**
 * Parses an array of followed BrokenLinksResultV1_SyntheticLinkResult's and
 * aggregates statistics into a single BrokenLinksResultV1 object.
 *
 * @param followed_links - An array of BrokenLinksResultV1_SyntheticLinkResult
 *                         containing link results.
 * @returns An aggregated BrokenLinksResultV1 containing overall statistics of
 *          the parsed links.
 */
function parseFollowedLinks(
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

    if (link.link_passed) {
      broken_links_result.passing_link_count =
        (broken_links_result.passing_link_count ?? 0) + 1;
    } else {
      broken_links_result.failing_link_count =
        (broken_links_result.failing_link_count ?? 0) + 1;
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

/**
 * Creates a SyntheticResult object representing the result of a broken link
 * synthetic execution.
 *
 * @param start_time - The start time of the synthetic test in ISO format.
 * @param options - The BrokenLinkCheckerOptions used for the test.
 * @param followed_links - An array of BrokenLinksResultV1_SyntheticLinkResult representing followed links.
 * @returns A SyntheticResult object containing the broken links result, runtime metadata, start time, and end time.
 */
export function createSyntheticResult(
  start_time: string,
  runtime_metadata: { [key: string]: string },
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions,
  followed_links: BrokenLinksResultV1_SyntheticLinkResult[]
): SyntheticResult {
  // Create BrokenLinksResultV1 by parsing followed links and setting options
  const broken_links_result: BrokenLinksResultV1 =
    parseFollowedLinks(followed_links);
  broken_links_result.options = options;

  // Create SyntheticResult object
  const synthetic_result: SyntheticResult = {
    synthetic_broken_links_result_v1: broken_links_result,
    runtime_metadata: runtime_metadata,
    start_time: start_time,
    end_time: new Date().toISOString(),
  };

  return synthetic_result;
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

/**
 * If the `link_order` is set to `RANDOM`, the links will be shuffled randomly.
 * Otherwise, the links will be copied without shuffling. Truncate to
 * `link_limit` regardless
 *
 * @param links - The array of links to process.
 * @param link_limit - The maximum number of links to retain.
 * @param link_order - Whether or not to shuffle links (enum value).
 * @returns A new array of links that have been truncated based on the `link_limit`.
 */
export function shuffleAndTruncate(
  links: LinkIntermediate[],
  link_limit: number,
  link_order: BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder
): LinkIntermediate[] {
  // shuffle links if link_order is `RANDOM` and truncate to link_limit

  // Shuffle the links if link_order is RANDOM, or copy the original array
  const linksToFollow =
    link_order === BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM
      ? [...links].sort(() => Math.random() - 0.5)
      : [...links];

  // Truncate the processed array to match the link_limit
  return linksToFollow.slice(0, link_limit! - 1);
}
