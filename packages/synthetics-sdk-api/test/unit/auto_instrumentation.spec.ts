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

import { resolveProjectId } from '../../src/auto_instrumentation';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Auto Instrumentation', async () => {
  describe('resolveProjectId', async () => {
    it('resolves with the project id if its found', async () => {
      sinon.replace(process, 'env', {GCLOUD_PROJECT: 'project-id'});
      const projectId = await resolveProjectId(undefined, {});

      expect(projectId).to.equal('project-id');

      sinon.restore();
    });

    it('resolves null if a project id is not found', async () => {
      const projectId = await resolveProjectId(undefined, {});
      expect(projectId).to.be.null;
    }).timeout(10000);

    it('resolves with the cached project id if it has already resolved', async () => {
      const stringProjectId = await resolveProjectId('already-defined', {});
      expect(stringProjectId).to.equal('already-defined');

      const nullProjectId = await resolveProjectId(null, {});
      expect(nullProjectId).to.equal(null);
    });
  });
});
