# Overview

This sample uses the `@google-cloud/synthetics-sdk-api` and `puppeteer` to create a Google Cloud Function that can be used with Google Cloud Monitoring Synthetics to monitor a url for broken links.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `startUrl` within `syntheticCode` function in index.js, to check any url for broken links.

## Running

The following command runs this sample locally

```
npx functions-framework --target=SyntheticFunction
```

The following command deploys this sample to gcp as a cloud function.

```
gcloud functions deploy broken-links-http-function --memory=1024M --timeout=540 --gen2 --runtime=nodejs18 --region=us-central1 --source=. --entry-point=SyntheticFunction --trigger-http
```
