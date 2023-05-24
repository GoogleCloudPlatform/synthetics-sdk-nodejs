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
  getRuntimeMetadata,
  reloadMetadata,
} from '../../src/runtime_metadata_extractor';

describe('runtimeMetadata', () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it('loads all runtime metadata', () => {
    process.env = {
      K_SERVICE: 'service_name',
      K_REVISION: 'service_revision',
      K_CONFIGURATION: 'configuration',
      npm_package_version: '1.0.0',
      npm_package_name: 'the package name',
      other: 'fields',
      that: 'dont',
      matter: 'at all',
    };
    reloadMetadata();

    expect(getRuntimeMetadata()).to.deep.equal({
      K_SERVICE: 'service_name',
      K_REVISION: 'service_revision',
      K_CONFIGURATION: 'configuration',
      npm_package_version: '1.0.0',
      npm_package_name: 'the package name',
    });
  });

  it('sets only metadata thats present and relevant', () => {
    process.env = { other: 'fields', that: 'dont', matter: 'at all' };
    reloadMetadata();

    expect(getRuntimeMetadata()).to.deep.equal({});
  });
});
