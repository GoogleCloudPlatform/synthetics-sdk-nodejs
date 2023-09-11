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
  BrokenLinksResultV1_SyntheticLinkResult,
  getRuntimeMetadata,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';
import { LinkIntermediate, createSyntheticResult } from './link_utils';
import { retrieveLinksFromPage } from './navigation_func';
import { setDefaultOptions } from './options_func';

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
