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

import { runBrokenLinks, BrokenLinkCheckerOptions } from './broken_links';
import { Request, Response } from 'express';

const syntheticExecutionIdHeader = 'Synthetic-Execution-Id';
const checkIdHeader = 'Check-Id';

/**
 * Middleware for easy invocation of SyntheticSDK broken links, and may be used to
 * register a GoogleCloudFunction http function, or express js compatible handler.
 * @public
 * @param options - Options for running GCM Synthetics Broken Links.
 * @returns ExpressJS compatible middleware that invokes SyntheticsSDK broken links, and
 * returns the results via res.send
 */
export function runBrokenLinksHandler(options: BrokenLinkCheckerOptions) {
  return testableRunBrokenLinksHandler(options);
}

/**
 * Helper function to aid in testing the `runBrokenLinksHandler` middleware.
 * Allows for the injection of a mock or stubbed `runBrokenLinks` implementation.
 *
 * @param options - Options for running GCM Synthetics Broken Links.
 * @param runBrokenLinksOverride - (Optional) An alternative implementation of
 *                                 the `runBrokenLinks` function.  Defaults to the
 *                                 standard `runBrokenLinks` if not provided.
 * @returns ExpressJS compatible middleware that invokes the specified
 *          (or default) `runBrokenLinks` implementation.
 */
export function testableRunBrokenLinksHandler(
  options: BrokenLinkCheckerOptions,
  runBrokenLinksOverride = runBrokenLinks
) {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return async (req: Request, res: Response): Promise<any> =>
    res.send(
      await runBrokenLinksOverride(options, {
        executionId: req.get(syntheticExecutionIdHeader),
        checkId: req.get(checkIdHeader),
      })
    );
}
