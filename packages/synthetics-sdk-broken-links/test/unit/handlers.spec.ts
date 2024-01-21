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
import httpMocks from 'node-mocks-http';
import sinon from 'sinon';

import { testableRunBrokenLinksHandler } from '../../src/handlers';
import { BrokenLinkCheckerOptions } from '../../src/broken_links';

describe('Broken Links Synthetic Handler', async () => {
  it('has check id and execution id available', async () => {
    // Stub the runBrokenLinks function using Sinon
    const mockRunBrokenLinks = sinon.stub().callsFake(async (opts, args) => {
      console.log('mockRunBrokenLinks called with:', opts, args);
      return Promise.resolve({ mocked_response: 'is unimportant' });
    });

    // Options for the runBrokenLinksHandler
    const options: BrokenLinkCheckerOptions = {
      origin_uri: 'https://example.com',
    };

    // Create mock request and response
    const req = httpMocks.createRequest({
      headers: {
        ['Synthetic-Execution-Id']: 'test-execution-id',
        ['Check-Id']: 'test-check-id',
      },
    });
    const res = httpMocks.createResponse();

    // Call the middleware
    await testableRunBrokenLinksHandler(options, mockRunBrokenLinks)(req, res);

    // Assertions with Sinon and Chai
    sinon.assert.calledWith(mockRunBrokenLinks, options, {
      executionId: 'test-execution-id',
      checkId: 'test-check-id',
    });
    expect(res.statusCode).to.equal(200);
  }).timeout(5000);
});
