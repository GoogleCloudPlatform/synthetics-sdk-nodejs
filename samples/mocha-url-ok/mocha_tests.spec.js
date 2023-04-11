// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
 * This is the file may be interacted with to author mocha tests. To interact
 * with other GCP products or services, users should add dependencies to the
 * package.json file, and require those dependencies here A few examples:
 *  - @google-cloud/secret-manager:
 *        https://www.npmjs.com/package/@google-cloud/secret-manager
 *  - @google-cloud/spanner: https://www.npmjs.com/package/@google-cloud/spanner
 *  - Supertest: https://www.npmjs.com/package/supertest
 */

const {expect} = require('chai');
const fetch = require('node-fetch');

it('pings my website', async () => {
  const url = 'https://google.com/'; // URL to send the request to
  const externalRes = await fetch(url);
  expect(externalRes.ok).to.be.true;
});