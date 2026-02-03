[![npm version](https://img.shields.io/npm/v/@google-cloud/synthetics-sdk-broken-links.svg)](https://www.npmjs.com/package/@google-cloud/synthetics-sdk-broken-links)

# Synthetics SDK Broken Links

## Installation

```
npm install --save @google-cloud/synthetics-sdk-broken-links
```

## Usage With Cloud Function V2

Google Cloud Monitoring Synthetics requires a Cloud Function v2 target, and as such, this guide explains how to set up a simple Function that uses the `@google-cloud/synthetics-sdk-brokens` package that runs a basic broken link checker that ensures that an http endpoint returns OK.

### Write Synthetic Function & Broken Link Options
```bash
$ npm init
$ npm install --save @google-cloud/synthetics-sdk-broken-links
$ npm install --save @google-cloud/functions-framework
```

`index.js`
```javascript
// index.js
const functions = require('@google-cloud/functions-framework');
const GcmSynthetics = require('@google-cloud/synthetics-sdk-broken-links');

// all fields are options except origin_uri
const options = {
  origin_uri: "https://example.com",
  link_limit: 10,
  query_selector_all: "a", // https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
  get_attributes: ['href'], // https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute
  link_order: "FIRST_N", // "FIRST_N" or "RANDOM"
  link_timeout_millis: 30000, // timeout per link
  max_retries: 0, // number of retries per link if it failed for any reason
  wait_for_selector: '', // https://pptr.dev/api/puppeteer.page.waitforselector
  per_link_options: {},
  total_synthetic_timeout_millis: 60000 // Timeout set for the entire Synthetic Monitor
};

functions.http('BrokenLinkChecker', GcmSynthetics.runBrokenLinksHandler(options));
```

`.puppeteerrc.cjs`  —  You must include this file so that GCF knows where to find Chrome
```javascript
// .puppeteerrc.cjs`

const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
```

`package.json`  —  You must include this `gcp-build` in scripts or your funciton will not redeploy correctly
```json
"scripts": {
  "gcp-build": "node node_modules/puppeteer/install.mjs"
}
```

### Create Function and Synthetic Monitor

Deploy function using gcloud
```bash
$ gcloud functions deploy <<service-name>> --gen2 --runtime=nodejs18 --region=<<region>> --source=. --entry-point=BrokenLinkChecker --memory=2048M --timeout=60 --trigger-http
```

The created function may now be used within the Google Cloud Monitoring Synthetics product, where you may set up periodic invocation of the function. The output from Google Cloud Monitoring will result in metrics, logs, and alerts based on the results of the execution.


# Useful Links

* For a sample, see [broken-links-ok](../../samples/broken-links-ok/)
* For documentation regarding Google Cloud Monitoring Synthetics, visit [cloud.google.com/monitoring/](https://cloud.google.com/monitoring/)
* For documentation on Cloud Functions, visit [https://cloud.google.com/functions](https://cloud.google.com/functions/docs/concepts/version-comparison#new-in-2nd-gen)
