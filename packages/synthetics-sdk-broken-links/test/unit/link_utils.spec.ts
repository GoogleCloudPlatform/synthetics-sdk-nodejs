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

// Standard Libraries
import { expect } from 'chai';

// Internal Project Files
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_CaptureCondition as ApiCaptureCondition,
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import { LinkOrder, StatusClass } from '../../src/broken_links';
import {
  checkStatusPassing,
  createSyntheticResult,
  getGenericSyntheticResult,
  LinkIntermediate,
  shuffleAndTruncate,
  shouldTakeScreenshot,
} from '../../src/link_utils';
import { setDefaultOptions } from '../../src/options_func';

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
  const default_errors: BaseError[] = [
    { error_type: 'fake-error-type', error_message: 'fake-error-message' },
  ];

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
        origin_uri: 'https://example.com',
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
      all_links,
      default_errors
    );

    // BrokenLinkResultV1 expectations (testing `parseFollowedLinks`)
    const broken_links_result =
      syntheticResult.synthetic_broken_links_result_v1;
    expect(broken_links_result).to.deep.equal({
      link_count: 8,
      passing_link_count: 5,
      failing_link_count: 3,
      unreachable_count: 1,
      status2xx_count: 4,
      status3xx_count: 1,
      status4xx_count: 1,
      status5xx_count: 1,
      options: options,
      origin_link_result: origin_link,
      followed_link_results: followed_links,
      execution_data_storage_path: '',
      errors: default_errors,
    });

    expect(
      new Date(syntheticResult.start_time).getTime()
    ).to.be.lessThanOrEqual(new Date(syntheticResult.end_time).getTime());
    expect(syntheticResult.runtime_metadata).to.not.be.undefined;
  });

  describe('shuffleAndTruncate', () => {
    const links: LinkIntermediate[] = [
      { target_uri: 'link1', html_element: '', anchor_text: '' },
      { target_uri: 'link2', html_element: '', anchor_text: '' },
      { target_uri: 'link3', html_element: '', anchor_text: '' },
      { target_uri: 'link4', html_element: '', anchor_text: '' },
      { target_uri: 'link5', html_element: '', anchor_text: '' },
      { target_uri: 'link6', html_element: '', anchor_text: '' },
      { target_uri: 'link7', html_element: '', anchor_text: '' },
      { target_uri: 'link8', html_element: '', anchor_text: '' },
    ];
    const random =
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM;
    const firstN =
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N;

    it('shuffles links when link_order is RANDOM', () => {
      const link_limit = 10;

      const shuffledLinks = shuffleAndTruncate(links, link_limit, random);
      // Expect that the shuffledLinks array is not equal to the original links array
      expect(shuffledLinks).to.not.deep.equal(links);
    });

    it('does not shuffle links when link_order is not RANDOM', () => {
      const link_limit = 10;

      const unshuffledLinks = shuffleAndTruncate(links, link_limit, firstN);
      // Expect that the shuffledLinks array is equal to the original links array
      expect(unshuffledLinks).to.deep.equal(links);
    });

    it('truncates to link_limit if less than the number of links', () => {
      const link_limit = 3; // Less than the number of links

      const truncatedLinks = shuffleAndTruncate(links, link_limit, firstN);
      // Expect that the truncatedLinks array has a length equal to link_limit-1
      // (this is to account for the origin_uri being included in link_limit)
      expect(truncatedLinks).to.have.lengthOf(link_limit - 1);
    });
  });

  it('getGenericSyntheticResult returns a minimum of 1 millisecond difference between start and end time', () => {
    const genericResult = getGenericSyntheticResult(
      new Date().toISOString(),
      ''
    );
    const startTime = new Date(genericResult.start_time).getTime();
    const endTime = new Date(genericResult.end_time).getTime();
    const milliDifference = endTime - startTime;

    expect(startTime).to.be.lessThan(endTime);
    expect(milliDifference).to.be.greaterThan(0);
  });

  describe('shouldTakeScreenshot', () => {
    describe('screenshot_condition: ALL', () => {
      it('should return true when passed is true', () => {
        const options = {
          screenshot_options: { capture_condition: ApiCaptureCondition.ALL },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
        const result = shouldTakeScreenshot(options, true);
        expect(result).to.be.true;
      });

      it('should return true when passed is false', () => {
        const options = {
          screenshot_options: { capture_condition: ApiCaptureCondition.ALL },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
        const result = shouldTakeScreenshot(options, false);
        expect(result).to.be.true;
      });
    });
    describe('screenshot_condition: FAILING', () => {
      it('should return true if passed is false', () => {
        const options = {
          screenshot_options: {
            capture_condition: ApiCaptureCondition.FAILING,
          },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
        const result = shouldTakeScreenshot(options, false);
        expect(result).to.be.true;
      });

      it('should return false if passed is true', () => {
        const options = {
          screenshot_options: {
            capture_condition: ApiCaptureCondition.FAILING,
          },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
        const result = shouldTakeScreenshot(options, true);
        expect(result).to.be.false;
      });
    });

    describe('screenshot_condition: NONE', () => {
      it('should always return false', () => {
        const options = {
          screenshot_options: { capture_condition: ApiCaptureCondition.NONE },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;
        const result1 = shouldTakeScreenshot(options, true);
        const result2 = shouldTakeScreenshot(options, false);
        expect(result1).to.be.false;
        expect(result2).to.be.false;
      });
    });
  });
});
