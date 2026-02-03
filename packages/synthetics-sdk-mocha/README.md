[![npm version](https://img.shields.io/npm/v/@google-cloud/synthetics-sdk-mocha.svg)](https://www.npmjs.com/package/@google-cloud/synthetics-sdk-mocha)

# Synthetics SDK Mocha

The Synthetics SDK Mocha is a framework that runs a provided mocha test suite, and returns a response that may be consumed by the Google Cloud Monitoring Synthetics.

## Installation

```
npm install --save @google-cloud/synthetics-sdk-mocha
```

## Usage With Cloud Function V2

Google Cloud Monitoring Synthetics requires a Cloud Function v2 target, and as such, this guide explains how to set up a simple Function that uses the `@google-cloud/synthetics-sdk-mocha` package that runs a basic mocha test that ensures that an http endpoint returns OK.

### Write Synthetic Function & Mocha Tests
```bash
$ npm init
$ npm install --save @google-cloud/synthetics-sdk-mocha
$ npm install --save @google-cloud/functions-framework

# This example uses...
# * chai as an expectation framework
# * node-fetch for http requests
$ npm install --save chai
$ npm install --save node-fetch
```

`index.js`
```javascript
// index.js
const functions = require('@google-cloud/functions-framework');
const GcmSynthetics = require('@google-cloud/synthetics-sdk-mocha');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */

functions.http('SyntheticMochaSuite', GcmSynthetics.runMochaHandler({
    spec: `${__dirname}/mocha_tests.spec.js}`
}));
```

`./mocha_tests.spec.js`
```javascript
// This file is in the same file as index.js
const {expect} = require('chai');
const fetch = require('node-fetch');

it('pings my website', async () => {
  const url = '<<YOUR URL HERE>>'; // URL to send the request to
  const externalRes = await fetch(url);
  expect(externalRes.ok).to.be.true;
});
```

### Create Function and Synthetic Monitor

Deploy function using gcloud
```bash
$ gcloud functions deploy <<service-name>> --gen2 --runtime=nodejs18 --region=<<region>> --source=. --entry-point=SyntheticMochaSuite --trigger-http
```

The created function may now be used within the Google Cloud Monitoring Synthetics product, where you may set up periodic invocation of the function, who's output will result in metrics, logs, and alerts based off of the results of the test.

# Useful Links

* For a sample, see [mocha-url-ok](../../samples/mocha-url-ok/)
* For more information on Mocha, visit [mochajs.org](https://mochajs.org/)
* For documentation regarding Google Cloud Monitoring Synthetics, visit [cloud.google.com/monitoring/](https://cloud.google.com/monitoring/)
* For documentation on Cloud Functions, visit [https://cloud.google.com/functions](https://cloud.google.com/functions/docs/concepts/version-comparison#new-in-2nd-gen)
