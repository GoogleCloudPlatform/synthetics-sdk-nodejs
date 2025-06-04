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

import * as sinon from 'sinon';
import { expect } from 'chai';
import { getExecutionRegion } from '../../src/cloud_region_resolver';

describe('getExecutionRegion (with fetch)', () => {
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    fetchStub = sinon.stub(global, 'fetch');
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('should retrieve the region from the metadata server', async () => {
    const mockResponse = {
      ok: true,
      text: () => Promise.resolve('projects/123456789/regions/us-east1'),
    };
    fetchStub.resolves(mockResponse as any);

    const region = await getExecutionRegion();
    expect(region).to.equal('us-east1');
    expect(fetchStub.calledOnce).to.be.true;
  });

  it('should handle errors from the metadata server', async () => {
    fetchStub.rejects(new Error('Network error'));

    const region = await getExecutionRegion();
    
    expect(region).to.be.null;
  });
});
