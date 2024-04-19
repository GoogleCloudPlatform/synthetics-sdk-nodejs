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
import sinon from 'sinon';

// Internal Project Files
import {
  BaseError,
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  BrokenLinksResultV1_BrokenLinkCheckerOptions_ScreenshotOptions_CaptureCondition as ApiCaptureCondition,
} from '@google-cloud/synthetics-sdk-api';
import {
  createStorageClientIfStorageSelected,
  StorageParameters,
  uploadScreenshotToGCS,
} from '../../src/storage_func';

// External Dependencies
import { Bucket, File, Storage } from '@google-cloud/storage';
const proxyquire = require('proxyquire');
import { Page } from 'puppeteer';

// global test vars
export const TEST_BUCKET_NAME = 'gcm-test-project-id-synthetics-test-region';

describe('GCM Synthetics Broken Links storage_func suite testing', () => {
  let storageClientStub: sinon.SinonStubbedInstance<Storage>;
  let bucketStub: sinon.SinonStubbedInstance<Bucket>;

  const storageFunc = proxyquire('../../src/storage_func', {
    '@google-cloud/synthetics-sdk-api': {
      getExecutionRegion: () => 'test-region',
      resolveProjectId: () => 'test-project-id',
    },
  });

  const storage_condition_failing_links = ApiCaptureCondition.FAILING;
  const storage_condition_none = ApiCaptureCondition.NONE;

  beforeEach(() => {
    // Stub a storage bucket
    bucketStub = sinon.createStubInstance(Bucket);
    bucketStub.name = TEST_BUCKET_NAME;
    bucketStub.create.resolves([bucketStub]);

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

    it('should return null if projectId or region cannot be resolved', async () => {
      const failingProjectId = proxyquire('../../src/storage_func', {
        '@google-cloud/synthetics-sdk-api': {
          getExecutionRegion: () => 'test-region',
          resolveProjectId: () => '',
        },
      });

      const result = await failingProjectId.getOrCreateStorageBucket(
        storageClientStub,
        '',
        []
      );
      expect(result).to.be.null;
    });

    it('should return existing synthetics bucket if found when storage_location is not provided ', async () => {
      bucketStub.exists.resolves([true]); // Simulate the bucket already exists

      const result = await storageFunc.getOrCreateStorageBucket(
        storageClientStub,
        TEST_BUCKET_NAME + '/fake-folder',
        []
      );
      expect(result).to.equal(bucketStub);
      sinon.assert.calledWithExactly(
        storageClientStub.bucket,
        TEST_BUCKET_NAME
      );
      sinon.assert.notCalled(bucketStub.create);
    });

    it('should handle errors during bucket.exists()', async () => {
      bucketStub.exists.throws(new Error('Simulated exists() error'));

      const errors: BaseError[] = [];
      const result = await storageFunc.getOrCreateStorageBucket(
        storageClientStub,
        'user-bucket',
        errors
      );

      expect(result).to.be.null;
      expect(errors.length).to.equal(1);
      expect(errors[0].error_type).to.equal('StorageValidationError');
    });

    it('should handle errors during bucket creation', async () => {
      bucketStub.create.throws(new Error('Simulated creation error')); // Force an error

      const errors: BaseError[] = [];
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

  describe('uploadScreenshotToGCS', () => {
    let storageClientStub: sinon.SinonStubbedInstance<Storage>;
    let bucketStub: sinon.SinonStubbedInstance<Bucket>;
    let pageStub: sinon.SinonStubbedInstance<Page>;

    beforeEach(() => {
      storageClientStub = sinon.createStubInstance(Storage);
      bucketStub = sinon.createStubInstance(Bucket);
      pageStub = sinon.createStubInstance(Page);
      pageStub.url.resolves('https://fake-url');

      storageClientStub.bucket.returns(bucketStub);
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('Valid Storage Configuration', () => {
      it('should upload the screenshots and return updated write_destination', async () => {
        const storageParams = {
          storageClient: storageClientStub,
          bucket: bucketStub,
          checkId: 'uptime123',
          executionId: 'exec456',
          screenshotNumber: 1,
        };
        const options = {
          screenshot_options: { storage_location: 'bucket/folder1/folder2' },
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;

        const successPartialFileMock: Partial<File> = {
          save: sinon.stub().resolves(),
        };
        bucketStub.file.returns(successPartialFileMock as File);

        const result = await uploadScreenshotToGCS(
          pageStub,
          storageParams,
          options
        );

        expect(result.screenshot_file).to.equal('screenshot_1.png');
        expect(result.screenshot_error).to.deep.equal({});

        const result2 = await uploadScreenshotToGCS(
          pageStub,
          storageParams,
          options
        );

        expect(result2.screenshot_file).to.equal('screenshot_2.png');
        expect(result2.screenshot_error).to.deep.equal({});
      });

      it('should handle GCS upload errors', async () => {
        const storageParams: StorageParameters = {
          storageClient: storageClientStub,
          bucket: bucketStub,
          checkId: '',
          executionId: '',
          screenshotNumber: 1,
        };
        const options = {
          screenshot_options: {},
        } as BrokenLinksResultV1_BrokenLinkCheckerOptions;

        const gcsError = new Error('Simulated GCS upload error');
        const failingPartialFileMock: Partial<File> = {
          save: sinon.stub().throws(gcsError),
        };
        bucketStub.file.returns(failingPartialFileMock as File);

        const result = await uploadScreenshotToGCS(
          pageStub,
          storageParams,
          options
        );

        expect(result.screenshot_file).to.equal('');
        expect(result.screenshot_error).to.deep.equal({
          error_type: 'ScreenshotFileUploadError',
          error_message:
            'Failed to take and/or upload screenshot for https://fake-url. Please reference server logs for further information.',
        });
      });
    });

    describe('Invalid Storage Configuration', () => {
      const emptyOptions = {} as BrokenLinksResultV1_BrokenLinkCheckerOptions;

      beforeEach(() => {
        pageStub.screenshot.resolves(
          Buffer.from('encoded-image-data', 'utf-8')
        );
      });

      it('should return an empty result if storageClient is null', async () => {
        // Missing storageClient
        const storageParams = {
          storageClient: null,
          bucket: bucketStub,
          checkId: '',
          executionId: '',
          screenshotNumber: 1,
        };

        const result = await uploadScreenshotToGCS(
          pageStub,
          storageParams,
          emptyOptions
        );

        expect(result).to.deep.equal({
          screenshot_file: '',
          screenshot_error: {},
        });
      });

      it('should return an empty result if bucket is null', async () => {
        // Missing bucket
        const storageParams = {
          storageClient: storageClientStub,
          bucket: null,
          checkId: '',
          executionId: '',
          screenshotNumber: 1,
        } as StorageParameters;

        const result = await uploadScreenshotToGCS(
          pageStub,
          storageParams,
          emptyOptions
        );

        expect(result).to.deep.equal({
          screenshot_file: '',
          screenshot_error: {},
        });
      });
    });
  });
});
