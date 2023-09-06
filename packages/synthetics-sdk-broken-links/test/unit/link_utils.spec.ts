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
  BrokenLinksResultV1_SyntheticLinkResult,
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
import {
  BrokenLinkCheckerOptions,
  LinkOrder,
  StatusClass,
} from '../../src/broken_links_func';
import {
  checkStatusPassing,
  createSyntheticResult,
  LinkIntermediate,
  setDefaultOptions,
  shouldGoToBlankPage,
  shuffleAndTruncate,
  validateInputOptions,
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

  describe('validateInputOptions', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it('throws error if origin_url is missing', () => {
      const options = {} as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'Missing origin_url in options');
    });
    it('throws error if origin_url does not start with http', () => {
      const options = { origin_url: 'blah' } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'origin_url must start with `http`');
    });
    it('throws error if link_limit is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_limit value, must be a number greater than 0'
      );
    });
    it('throws error if link_limit is less than 1', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 0,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_limit value, must be a number greater than 0'
      );
    });
    it('throws error if query_selector_all is not a string', () => {
      const options = {
        origin_url: 'http://example.com',
        query_selector_all: 123,
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid query_selector_all value, must be a non-empty string'
      );
    });
    it('throws error if query_selector_all is an empty string', () => {
      const options = {
        origin_url: 'http://example.com',
        query_selector_all: '',
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid query_selector_all value, must be a non-empty string'
      );
    });
    it('throws error if get_attributes is not an array of strings', () => {
      const options = {
        origin_url: 'http://example.com',
        get_attributes: ['href', 123],
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid get_attributes value, must be an array of only strings'
      );
    });
    it('throws error if link_order is not a valid LinkOrder value', () => {
      const options = {
        origin_url: 'http://example.com',
        link_order: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_order value, must be `FIRST_N` or `RANDOM`'
      );
    });
    it('link_order accepts string', () => {
      const options = {
        origin_url: 'http://example.com',
        link_order: 'RANDOM',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.not.throw();
    });
    it('throws error if link_timeout_millis is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        link_timeout_millis: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value, must be a number greater than 0'
      );
    });
    it('throws error if link_timeout_millis is less than 1', () => {
      const options = {
        origin_url: 'http://example.com',
        link_timeout_millis: 0,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value, must be a number greater than 0'
      );
    });
    it('throws error if max_retries is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        max_retries: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_retries value, must be a number greater than -1'
      );
    });
    it('throws error if max_retries is less than -1', () => {
      const options = {
        origin_url: 'http://example.com',
        max_retries: -2,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_retries value, must be a number greater than -1'
      );
    });
    it('throws error if max_redirects is not a number', () => {
      const options = {
        origin_url: 'http://example.com',
        max_redirects: 'invalid',
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(Error, 'Invalid max_redirects');
    });
    it('throws error if max_redirects is less than -1', () => {
      const options = {
        origin_url: 'http://example.com',
        max_redirects: -2,
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid max_redirects value, must be a number greater than -1'
      );
    });
    it('throws error if wait_for_selector is not a string', () => {
      const options = {
        origin_url: 'http://example.com',
        wait_for_selector: 123,
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid wait_for_selector value, must be a non-empty string'
      );
    });
    it('throws error if wait_for_selector is an empty string', () => {
      const options = {
        origin_url: 'http://example.com',
        wait_for_selector: '',
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid wait_for_selector value, must be a non-empty string'
      );
    });
    it('throws error if per_link_options contains an invalid URL', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'invalid-url': {
            link_timeout_millis: 5000,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid url in per_link_options, urls must start with `http`'
      );
    });
    it('throws error if per_link_options contains an invalid link_timeout_millis value', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            link_timeout_millis: -1,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid link_timeout_millis value in per_link_options set for http://example.com, must be a number greater than 0'
      );
    });
    it('throws error if per_link_options contains an invalid expected_status_code number', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 50,
          },
        },
      } as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid expected_status_code in per_link_options for http://example.com, must be a number between 100 and 599 (inclusive) or a string present in StatusClass enum'
      );
    });
    it('throws error if per_link_options contains an invalid expected_status_code string', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 'STATUS_CLASS_WOOHOO',
          },
        },
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.throw(
        Error,
        'Invalid expected_status_code in per_link_options for http://example.com, must be a number between 100 and 599 (inclusive) or a string present in StatusClass enum'
      );
    });
    it('per_link_options accepts valid string as StatusClass', () => {
      const options = {
        origin_url: 'http://example.com',
        per_link_options: {
          'http://example.com': {
            expected_status_code: 'STATUS_CLASS_4XX',
          },
        },
      } as any as BrokenLinkCheckerOptions;
      expect(() => {
        validateInputOptions(options);
      }).to.not.throw();
    });
    it('validates input options when all values are valid', () => {
      const options = {
        origin_url: 'http://example.com',
        link_limit: 10,
        query_selector_all: 'a',
        get_attributes: ['href'],
        link_order: LinkOrder.FIRST_N,
        link_timeout_millis: 5000,
        max_retries: 3,
        max_redirects: 5,
        wait_for_selector: 'a.link',
        per_link_options: {
          'http://example.com': {
            link_timeout_millis: 3000,
            expected_status_code: StatusClass.STATUS_CLASS_2XX,
          },
        },
      } as BrokenLinkCheckerOptions;

      expect(() => {
        validateInputOptions(options);
      }).not.to.throw();
    });
    it('validates input options and gets rid of extra fields', () => {
      const options = {
        origin_url: 'http://example.com',
        fake_field: 'hello',
      } as any as BrokenLinkCheckerOptions;

      const expectations = {
        origin_url: 'http://example.com',
        link_limit: undefined,
        query_selector_all: undefined,
        get_attributes: undefined,
        link_order: undefined,
        link_timeout_millis: undefined,
        max_retries: undefined,
        max_redirects: undefined,
        wait_for_selector: undefined,
        per_link_options: undefined,
      } as BrokenLinkCheckerOptions;

      expect(() => {
        validateInputOptions(options);
      }).not.to.throw();
      expect(validateInputOptions(options)).to.deep.equal(expectations);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
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

  describe('shuffleAndTruncate', () => {
    const links: LinkIntermediate[] = [
      { target_url: 'link1', html_element: '', anchor_text: '' },
      { target_url: 'link2', html_element: '', anchor_text: '' },
      { target_url: 'link3', html_element: '', anchor_text: '' },
    ];
    const random =
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.RANDOM;
    const firstN =
      BrokenLinksResultV1_BrokenLinkCheckerOptions_LinkOrder.FIRST_N;
    it('shuffles links when link_order is RANDOM', () => {
      const link_limit = 5;

      const shuffledLinks = shuffleAndTruncate(links, link_limit, random);
      // Expect that the shuffledLinks array is not equal to the original links array
      expect(shuffledLinks).to.not.deep.equal(links);
    });
    it('does not shuffle links when link_order is not RANDOM', () => {
      const link_limit = 5;

      const unshuffledLinks = shuffleAndTruncate(links, link_limit, firstN);
      // Expect that the shuffledLinks array is equal to the original links array
      expect(unshuffledLinks).to.deep.equal(links);
    });
    it('truncates to link_limit if less than the number of links', () => {
      const link_limit = 3; // Less than the number of links

      const truncatedLinks = shuffleAndTruncate(links, link_limit, firstN);
      // Expect that the truncatedLinks array has a length equal to link_limit-1
      // (this is to account for the origin_url being included in link_limit)
      expect(truncatedLinks).to.have.lengthOf(link_limit - 1);
    });
  });
});
