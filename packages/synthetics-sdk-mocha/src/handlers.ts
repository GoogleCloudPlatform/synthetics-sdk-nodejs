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

import { mocha, SyntheticMochaOptions } from './mocha';
import { Request, Response } from 'express';

/**
 * Middleware for easy invocation of SyntheticSDK mocha, and may be used to
 * register a GoogleCloudFunction http function, or express js compatible handler.
 * @public
 * @param options - Options for running GCM Synthetics Mocha.
 * @returns ExpressJS compatible middleware that invokes SyntheticsSDK mocha, and
 * returns the results via res.send
 */
export function mochaHandler(options: SyntheticMochaOptions) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return async (req: Request, res: Response): Promise<any> =>
    res.send(await mocha(options));
}
