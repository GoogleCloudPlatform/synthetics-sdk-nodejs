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
import { checkStatusPassing } from "../../src/link_utils"

describe('GCM Synthetics Broken Links', async () => {
    const success_status_value: ResponseStatusCode = {status_value: 200};
    const failure_status_value: ResponseStatusCode = {status_value: 404};
    const status_class_1xx: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_1XX }
    const status_class_2xx: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_2XX }
    const status_class_3xx: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_3XX }
    const status_class_4xx: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_4XX }
    const status_class_5xx: ResponseStatusCode = {status_class: ResponseStatusCode_StatusClass.STATUS_CLASS_5XX }

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
});
