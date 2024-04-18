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

import axios from 'axios';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { getExecutionRegion } from '../../src/cloud_region_resolver';

describe('getExecutionRegion', () => {
  let axiosGetStub: sinon.SinonStub;

  beforeEach(() => {
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    axiosGetStub.restore();
  });

  it('should retrieve the region from the metadata server', async () => {
    axiosGetStub.resolves({ data: 'projects/123456789/regions/us-east1' });

    const region = await getExecutionRegion();
    expect(region).to.equal('us-east1');
    expect(axiosGetStub.calledOnce).to.be.true;
  });

  it('should handle errors from the metadata server', async () => {
    axiosGetStub.rejects(new Error('Metadata server error'));

    const region = await getExecutionRegion();
    expect(region).to.be.null;
  });
});
