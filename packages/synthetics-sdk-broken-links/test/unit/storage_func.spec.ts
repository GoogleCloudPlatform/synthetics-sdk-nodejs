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
import sinon from 'sinon';
import { Storage, Bucket } from '@google-cloud/storage';
import * as sdkApi from '@google-cloud/synthetics-sdk-api';
import {
  createStorageClientIfStorageSelected,
  getOrCreateStorageBucket,
} from '../../src/storage_func';
const proxyquire = require('proxyquire');

// global test vars
const TEST_BUCKET_NAME = 'gcm-test-project-id-synthetics-test-region';

describe.only('GCM Synthetics Broken Links storage_func suite testing', () => {
  let storageClientStub: sinon.SinonStubbedInstance<Storage>;
  let bucketStub: sinon.SinonStubbedInstance<Bucket>;

  const storageFunc = proxyquire('../../src/storage_func', {
    '@google-cloud/synthetics-sdk-api': {
      getExecutionRegion: () => 'test-region',
      resolveProjectId: () => 'test-project-id',
    },
  });

  const storage_condition_failing_links =
    sdkApi
      .BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition
      .FAILING;
  const storage_condition_none =
    sdkApi
      .BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_ScreenshotCondition
      .NONE;

  beforeEach(() => {
    // Stub a storage bucket
    bucketStub = sinon.createStubInstance(Bucket);
    bucketStub.name = TEST_BUCKET_NAME;
    bucketStub.create.resolves([bucketStub])

    // Stub the storage client
    storageClientStub = sinon.createStubInstance(Storage);
    storageClientStub.bucket.returns(bucketStub);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getOrCreateStorageBucket()', () => {
    it('should create a bucket if no storage_location is provided', async () => {
      bucketStub.exists.resolves([false]); // Simulate the bucket not existing initially

      const result = await storageFunc.getOrCreateStorageBucket(
        storageClientStub,
        '',
        []
      );
      expect(result).to.equal(bucketStub);
      expect(result.name).to.equal(TEST_BUCKET_NAME);
    });

    it('should return existing synthetics bucket if found when storage_location is not provided ', async () => {
      bucketStub.exists.resolves([true]); // Simulate the bucket already exists

      const result = await storageFunc.getOrCreateStorageBucket(
        storageClientStub,
        '',
        []
      );
      expect(result).to.equal(bucketStub);
      sinon.assert.notCalled(bucketStub.create);
    });

    it('should handle errors during bucket creation', async () => {
      bucketStub.create.throws(new Error('Simulated creation error')); // Force an error

      const errors: sdkApi.BaseError[] = [];
      const result = await storageFunc.getOrCreateStorageBucket(
        storageClientStub,
        '',
        errors
      );

      expect(result).to.be.null;
      expect(errors.length).to.equal(1);
      expect(errors[0].error_type).to.equal('BucketCreationError');
    });
  });

  describe('createStorageClient()', () => {
    it('should return null if storage_condition is `None`', () => {
      const result = createStorageClientIfStorageSelected(
        [],
        storage_condition_none
      );
      expect(result).to.be.null;
    });
    it('should successfully initialize a Storage client', () => {
      const result = createStorageClientIfStorageSelected(
        [],
        storage_condition_failing_links
      );
      expect(result).to.be.an.instanceOf(Storage);
    });
  });
});
