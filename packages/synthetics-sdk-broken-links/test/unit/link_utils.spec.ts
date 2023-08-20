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
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  BrokenLinkCheckerOptions,
  StatusClass,
  LinkOrder,
} from '../../src/broken_links';
import {
  checkStatusPassing,
  setDefaultOptions,
  shouldGoToBlankPage,
} from '../../src/link_utils';

describe('GCM Synthetics Broken Links Utilies', async () => {
  const status_value_200: ResponseStatusCode = { status_value: 200 };
  const status_value_304: ResponseStatusCode = { status_value: 304 };
  const status_value_404: ResponseStatusCode = { status_value: 404 };
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
    expect(checkStatusPassing(status_value_200, 200)).to.be.true;
    expect(checkStatusPassing(status_value_200, 404)).to.be.false;

    // expecting failure
    expect(checkStatusPassing(status_value_404, 200)).to.be.false;
    expect(checkStatusPassing(status_value_404, 404)).to.be.true;
  });

  it('returns correctly when passed a statusClass as ResponseStatusCode', () => {
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
    const input_options: BrokenLinkCheckerOptions = {
      origin_url: 'https://example.com',
      get_attributes: ['src'],
      link_order: LinkOrder.RANDOM,
      link_timeout_millis: 5000,
      wait_for_selector: '.content',
      per_link_options: {
        'fake-link1': { expected_status_code: StatusClass.STATUS_CLASS_4XX },
        'fake-link2': { expected_status_code: 304 },
        'fake-link3': { link_timeout_millis: 10 },
        'fake-link4': {
          expected_status_code: StatusClass.STATUS_CLASS_3XX,
          link_timeout_millis: 10,
        },
      },
    };
    const options = setDefaultOptions(input_options);

    // Verify that missing values are set to their default values
    expect(options.link_limit).to.equal(50);
    expect(options.query_selector_all).to.equal('a');
    expect(options.max_retries).to.equal(0);
    expect(options.max_redirects).to.equal(Number.MAX_SAFE_INTEGER);

    // Verify that existing values are not overridden
    expect(options.origin_url).to.equal('https://example.com');
    expect(options.get_attributes).to.deep.equal(['src']);
    expect(options.link_order).to.equal(
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM
    );
    expect(options.link_timeout_millis).to.equal(5000);
    expect(options.wait_for_selector).to.equal('.content');

    const link_options = {
      'fake-link1': {
        expected_status_code: status_class_4xx,
        link_timeout_millis: 5000,
      },
      'fake-link2': {
        expected_status_code: status_value_304,
        link_timeout_millis: 5000,
      },
      'fake-link3': {
        expected_status_code: status_class_2xx,
        link_timeout_millis: 10,
      },
      'fake-link4': {
        expected_status_code: status_class_3xx,
        link_timeout_millis: 10,
      },
    };
    expect(options.per_link_options).to.deep.equal(link_options);
  });

  describe('shouldGoToBlankPage', () => {
    it('should return true for different anchor parts', () => {
      const current_url = 'http://example.com/page1#section1';
      const target_url = 'http://example.com/page1#section2';
      expect(shouldGoToBlankPage(current_url, target_url)).to.be.true;
    });

    it('should return false for same URLs', () => {
      const current_url = 'http://example.com/page1#section1';
      const target_url = 'http://example.com/page1#section1';
      expect(shouldGoToBlankPage(current_url, target_url)).to.be.true;
    });

    it('should return false for different URLs', () => {
      const current_url = 'http://example.com/page1#section1';
      const target_url = 'http://example.com/page2#section1';
      expect(shouldGoToBlankPage(current_url, target_url)).to.be.false;
    });

    it('should return true if target has # and current does not', () => {
      const current_url = 'http://example.com/page1';
      const target_url = 'http://example.com/page1#section1';
      expect(shouldGoToBlankPage(current_url, target_url)).to.be.true;
    });

    it('should return false if target has no #', () => {
      const current_url = 'http://example.com/page1#section1';
      const target_url = 'http://example.com/page1';
      expect(shouldGoToBlankPage(current_url, target_url)).to.be.false;
    });
  });
});
