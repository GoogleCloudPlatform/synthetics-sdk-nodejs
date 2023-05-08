# Overview

This sample uses the `@google-cloud/synthetics-sdk-api` to create a Google Cloud Function written in typescript that can be used with Google Cloud Monitoring Synthetics.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `syntheticCode` function in index.ts, to include whatever workflow you want to verify.

## Running 

The following command runs this sample locally
```
npm run start
```

The following command deploys this sample to gcp as a cloud function.
```
gcloud functions deploy typescript-http-function --gen2 --runtime=nodejs18 --region=us-central1 --source=. --entry-point=SyntheticFunction --trigger-http
```

## Useful Links

For more on a valid codebase setup for typescript and Cloud Functions, see [example](https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/typescript.md).