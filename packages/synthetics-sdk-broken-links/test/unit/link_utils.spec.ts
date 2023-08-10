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

import {expect} from 'chai';
import {
  ResponseStatusCode,
  ResponseStatusCode_StatusClass,
} from '@google-cloud/synthetics-sdk-api';
const BrokenLinksUtils = require('synthetics-sdk-broken-links-utils');

describe('GCM Synthetics Broken Links', async () => {
  describe('utilities', async () => {
    const failure_status_value: ResponseStatusCode = {status_value: 404};
    const success_status_value: ResponseStatusCode = {status_value: 200};
    const failure_status_class: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_5XX, }
    const success_status_class: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX, }
    it('checkStatusPassing returns correctly when passed a number as ResponseStatusCode', () => {
      // expecting success
      expect(BrokenLinksUtils.checkStatusPassing(success_status_value, 200)).to.be.true;
      expect(BrokenLinksUtils.checkStatusPassing(success_status_value, 404)).to.be.false;

      // expecting failure
      expect(BrokenLinksUtils.checkStatusPassing(failure_status_value, 200)).to.be.false;
      expect(BrokenLinksUtils.checkStatusPassing(failure_status_value, 404)).to.be.true;
    });

    it('checkStatusPassing returns correctly when passed a statusClass as ResponseStatusCode', () => {
      // expecting success
      expect(BrokenLinksUtils.checkStatusPassing(success_status_class, 200)).to.be.true;
      expect(BrokenLinksUtils.checkStatusPassing(success_status_class, 404)).to.be.false;

      // expecting failure
      expect(BrokenLinksUtils.checkStatusPassing(failure_status_class, 200)).to.be.false;
      expect(BrokenLinksUtils.checkStatusPassing(failure_status_class, 500)).to.be.true;
    });
  });
});
