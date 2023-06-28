[![npm version](https://img.shields.io/npm/v/@google-cloud/synthetics-sdk-api.svg)](https://www.npmjs.com/package/@google-cloud/synthetics-sdk-api)

# Synthetics SDK API

Note: This is an experimental package under active development. New releases may include breaking changes.

# Installation

```
npm install --save @google-cloud/synthetics-sdk-api
```

## Usage With Cloud Function V2

Google Cloud Monitoring Synthetics requires a Cloud Function v2 target, and as such, this guide explains how to set up a simple function that uses the `@google-cloud/synthetics-sdk-api` package.

```bash
$ npm init
$ npm install --save @google-cloud/synthetics-sdk-api
$ npm install --save @google-cloud/functions-framework

# This example uses node-fetch for http requests
$ npm install --save node-fetch
```

### Usage With runSyntheticHandler Middleware

This package provides an easy to use express compatible middleware for writing code that is invoked by Google Cloud Monitoring Synthetics. When a user written function is provided to it, a response is sent that may be consumed by Google's services. The following is an example `index.js` file that can be used as the entrypoint for a cloud function.

```javascript
// index.js
const assert = require("node:assert");
const functions = require("@google-cloud/functions-framework");
const fetch = require("node-fetch");
const GcmSynthetics = require("@google-cloud/synthetics-sdk-api");

functions.http("SyntheticFunction", GcmSynthetics.runSyntheticHandler(async () => {
    const url = "https://www.google.com/"; // URL to send the request to
    return await assert.doesNotReject(fetch(url));
  })
);
```

## Usage Without Framework

As long as a Google Cloud Function exposes an http endpoint that complies with the API spec as defined in the Synthetics SDK API package, the Cloud Function will work as a target for a Synthetic Monitor. As such, this package includes a proto definition that contains the api spec, as well as typescript types that are generated from that proto.

This is predominantly important if you want to run a programmatic workflow for which other SyntheticSDKs are not a good fit, or if you want to use another language for your Google Cloud function for which there is no direct support.

```typescript
const functions = require("@google-cloud/functions-framework");
const { SyntheticResult, GenericResultV1 } = require("@google-cloud/synthetics-sdk-api");
```

# Useful Links

* For a sample in plain nodejs, see [generic-synthetic-nodejs](../../samples/generic-synthetic-nodejs/)
* For a sample using typescript, see [generic-synthetic-typescript](../../samples/generic-synthetic-typescript/)
* For the api proto, see [synthetic_response.proto](./proto/synthetic_response.proto)
* For documentation regarding Google Cloud Monitoring Synthetics, visit [cloud.google.com/monitoring/](https://cloud.google.com/monitoring/)
* For documentation on Cloud Functions, visit [https://cloud.google.com/functions](https://cloud.google.com/functions/docs/concepts/version-comparison#new-in-2nd-gen)
