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
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  StatusClass,
  LinkOrder,
} from '../../src/broken_links';
import {
  checkStatusPassing,
  shouldGoToBlankPage,
  createSyntheticResult,
} from '../../src/link_utils';
import {
  setDefaultOptions,
} from '../../src/options_func';

describe('GCM Synthetics Broken Links Utilies', async () => {
  const status_value_200: ResponseStatusCode = { status_value: 200 };
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

  it('createSyntheticResult correctly sets all aggregate fields in BrokenLinksResultV1', () => {
    const origin_link = {
      link_passed: true,
      status_code: 200,
      is_origin: true,
    } as BrokenLinksResultV1_SyntheticLinkResult;

    const followed_links = [
      { link_passed: true, status_code: 200 },
      { link_passed: true, status_code: 200 },
      { link_passed: true, status_code: 200 },
      { link_passed: true, status_code: 304 }, // eg of link specific setting
      { link_passed: false, status_code: 404 },
      { link_passed: false, status_code: null },
      { link_passed: false, status_code: 505 },
    ] as BrokenLinksResultV1_SyntheticLinkResult[];

    const all_links = [origin_link, ...followed_links];
    const start_time = new Date().toISOString();
    const runtime_metadata = {
      K_SERVICE: 'fake-service',
      K_REVISION: 'fake-revision',
    };
    const options: BrokenLinksResultV1_BrokenLinkCheckerOptions =
      setDefaultOptions({
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
      });

    const syntheticResult = createSyntheticResult(
      start_time,
      runtime_metadata,
      options,
      all_links
    );

    // BrokenLinkResultV1 expectations (testing `parseFollowedLinks`)
    const broken_links_result =
      syntheticResult.synthetic_broken_links_result_v1;
    expect(broken_links_result).to.deep.equal({
      link_count: 8,
      passing_link_count: 5,
      failing_link_count: 3,
      unreachable_count: 1,
      status_2xx_count: 4,
      status_3xx_count: 1,
      status_4xx_count: 1,
      status_5xx_count: 1,
      options: options,
      origin_link_result: origin_link,
      followed_link_results: followed_links,
    });

    expect(
      new Date(syntheticResult.start_time).getTime()
    ).to.be.lessThanOrEqual(new Date(syntheticResult.end_time).getTime());
    expect(syntheticResult.runtime_metadata).to.not.be.undefined;
  });
});
