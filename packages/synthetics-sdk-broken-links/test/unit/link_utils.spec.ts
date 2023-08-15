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

import { expect } from 'chai';
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import { checkStatusPassing, setDefaultOptions } from '../../src/link_utils';

describe('GCM Synthetics Broken Links', async () => {
  const success_status_value: ResponseStatusCode = { status_value: 200 };
  const failure_status_value: ResponseStatusCode = { status_value: 404 };
  const status_class_1xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_1XX,
  };
  const status_class_2xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX,
  };
  const status_class_3xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_3XX,
  };
  const status_class_4xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_4XX,
  };
  const status_class_5xx: ResponseStatusCode = {
    status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_5XX,
  };

  it('checkStatusPassing returns correctly when passed a number as ResponseStatusCode', () => {
    // expecting success
    expect(checkStatusPassing(success_status_value, 200)).to.be.true;
    expect(checkStatusPassing(success_status_value, 404)).to.be.false;

    // expecting failure
    expect(checkStatusPassing(failure_status_value, 200)).to.be.false;
    expect(checkStatusPassing(failure_status_value, 404)).to.be.true;
  });

  it('checkStatusPassing returns correctly when passed a statusClass as ResponseStatusCode', () => {
    // expecting success
    expect(checkStatusPassing(status_class_1xx, 100)).to.be.true;
    expect(checkStatusPassing(status_class_2xx, 200)).to.be.true;
    expect(checkStatusPassing(status_class_3xx, 304)).to.be.true;
    expect(checkStatusPassing(status_class_4xx, 404)).to.be.true;
    expect(checkStatusPassing(status_class_5xx, 504)).to.be.true;

    // expecting failure
    expect(checkStatusPassing(status_class_1xx, 200)).to.be.false;
    expect(checkStatusPassing(status_class_2xx, 404)).to.be.false;
    expect(checkStatusPassing(status_class_3xx, 200)).to.be.false;
    expect(checkStatusPassing(status_class_4xx, 200)).to.be.false;
    expect(checkStatusPassing(status_class_5xx, 200)).to.be.false;
  });

  it('setDefaultOptions only sets non-present values', () => {
    const options = {
      origin_url: 'https://example.com',
      get_attributes: ['src'],
      link_order: BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM,
      link_timeout_millis: 5000,
      wait_for_selector: '.content',
    } as BrokenLinksResultV1_BrokenLinkCheckerOptions;

    // sets in place
    setDefaultOptions(options);

    // Verify that missing values are set to their default values
    expect(options.link_limit).to.equal(50);
    expect(options.query_selector_all).to.equal('a');
    expect(options.max_retries).to.equal(1);
    expect(options.max_redirects).to.equal(Number.MAX_SAFE_INTEGER);
    expect(options.per_link_options).to.deep.equal({});

    // Verify that existing values are not overridden
    expect(options.origin_url).to.equal('https://example.com');
    expect(options.get_attributes).to.deep.equal(['src']);
    expect(options.link_order).to.equal(
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM
    );
    expect(options.link_timeout_millis).to.equal(5000);
    expect(options.wait_for_selector).to.equal('.content');
  });
});
