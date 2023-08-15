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

// TODO should I use this stuff or redeclare it? anyway to make it less messy?
import {
  BrokenLinksResultV1_BrokenLinkCheckerOptions,
  ResponseStatusCode,
  SyntheticResult,
} from '@google-cloud/synthetics-sdk-api';

import { checkStatusPassing, setDefaultOptions } from './link_utils';

export async function runBrokenLinks(
  options: BrokenLinksResultV1_BrokenLinkCheckerOptions
): Promise<SyntheticResult> {
  // to resolve warnings
  options;
  checkStatusPassing({ status_value: 200 } as ResponseStatusCode, 200);

  // options object modified directly
  setDefaultOptions(options);

  return {} as SyntheticResult;
}
