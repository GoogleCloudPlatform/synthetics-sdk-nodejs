# Overview

This sample uses the `@google-cloud/synthetics-sdk-api` to create a Google Cloud Function that can be used with Google Cloud Monitoring Synthetics.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `runSyntheticHandler` function in index.js, to include whatever workflow you want to verify.

## Running

The following command runs this sample locally
```
npx functions-framework --target=CustomPuppeteerSynthetic
```

The following command deploys this sample to gcp as a cloud function v2.
```
gcloud functions deploy custom-puppeteer-synthetic --gen2 --runtime=nodejs18 --region=us-central1 --source=. --entry-point=CustomPuppeteerSynthetic --memory=2G --timeout=60 --trigger-http
```

## Running Local Synthetics SDK Changes

Use the following instructions to run the version of the synthetics-sdk-mocha package that has local changes. *The instructions should start from the root directory for the `synthetics-sdk` workspace.*

1. Pack "@google-cloud/synthetics-sdk-api" into tar file, output to samples/generic-puppeteer-nodejs

```
npm pack --workspaces --pack-destination=samples/generic-puppeteer-nodejs/
cd samples/generic-puppeteer-nodejs/
```


2. Open package.json, update synthetics-sdk-api dependency for "@google-cloud/synthetics-sdk-api" to use tar file.
```
"dependencies": {
    ...
    "@google-cloud/synthetics-sdk-api": "google-cloud-synthetics-sdk-api-0.1.0.tgz"
    ...
}
```

Proceed back to steps in [RUNNING](#Running)
