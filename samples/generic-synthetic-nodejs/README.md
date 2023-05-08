# Overview

This sample uses the `@google-cloud/synthetics-sdk-api` to create a Google Cloud Function that can be used with Google Cloud Monitoring Synthetics.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `syntheticCode` function in index.js, to include whatever workflow you want to verify.

## Running 

The following command runs this sample locally
```
npx functions-framework --target=SyntheticFunction
```

The following command deploys this sample to gcp as a cloud function.
```
gcloud functions deploy nodejs-http-function --gen2 --runtime=nodejs18 --region=us-central1 --source=. --entry-point=SyntheticFunction --trigger-http
```