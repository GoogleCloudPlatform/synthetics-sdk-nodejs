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
