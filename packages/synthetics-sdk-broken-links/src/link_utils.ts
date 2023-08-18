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

import { HTTPResponse } from 'puppeteer';
import {
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption,
} from '@google-cloud/synthetics-sdk-api';
import { BrokenLinkCheckerOptions, StatusClass } from './broken_links';

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
  link_start_time: string;

  /**
   * The end time of the link navigation.
   */
  link_end_time: string;
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

export interface LinkIntermediate {
  target_url: string;
  anchor_text: string;
  html_element: string;
}

export interface CommonResponseProps {
  responseOrError: HTTPResponse | Error | null;
  link_start_time: string;
  link_end_time: string;
}

export interface NavigateResponse extends CommonResponseProps {
  passed: boolean;
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
    // per_link_options is handled below
    if (!(optionName in inputOptions) || optionName === 'per_link_options') {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (outputOptions as any)[optionName] = defaulOptions[optionName];
    } else {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      (outputOptions as any)[optionName] = inputOptions[optionName];
    }
  }

  // Convert `input_options.per_link_options`, type: {[key: string]: PerLinkOption}
  // to `output_options.per_links_options`, type: {[key: string]: BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption}
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
 export function shouldGoToBlankPage(current_url: string, target_url: string): boolean {
  // Check if the target URL contains an anchor (#) and if the current URL
  // includes the same base URL (excluding the anchor part)
  return (
    target_url.includes('#') &&
    current_url.includes(target_url.substring(0, target_url.indexOf('#')))
  );
}

