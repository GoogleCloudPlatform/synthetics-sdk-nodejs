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

import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_PerLinkOption,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  BrokenLinkCheckerOptions,
  LinkOrder,
  StatusClass,
} from './broken_links';

/**
 * Validates the input options for the Broken Link Checker.
 *
 * @param inputOptions - The input options to be validated.
 * @returns The sanitized input options if validation passes.
 * @throws {Error} If any of the input options fail validation.
 */
export function validateInputOptions(inputOptions: BrokenLinkCheckerOptions) {
  if (!inputOptions.origin_uri) {
    throw new Error('Missing origin_uri in options');
  } else if (
    typeof inputOptions.origin_uri !== 'string' ||
    (!inputOptions.origin_uri.startsWith('http') &&
      !inputOptions.origin_uri.endsWith('.html'))
  ) {
    throw new Error('origin_uri must be a string that starts with `http`');
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
      inputOptions.link_timeout_millis < 9)
  ) {
    throw new Error(
      'Invalid link_timeout_millis value, must be a number greater than 9'
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
    // Check URI in per_link_options
    if (!key.startsWith('http')) {
      throw new Error(
        'Invalid uri in per_link_options, uris must start with `http`'
      );
    }

    // Check link_timeout_millis in per_link_options
    if (
      value.link_timeout_millis !== undefined &&
      (typeof inputOptions.link_timeout_millis !== 'number' ||
        inputOptions.link_timeout_millis < 9)
    ) {
      throw new Error(
        `Invalid link_timeout_millis value in per_link_options set for ${key}, must be a number greater than 9`
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
    origin_uri: inputOptions.origin_uri,
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
    origin_uri: '',
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
  for (const [uri, perLinkOption] of Object.entries(
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
    perLinkOptions[uri] = convertedPerLinkOption;
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
