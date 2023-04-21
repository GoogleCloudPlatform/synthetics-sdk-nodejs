# Overview

This sample uses the `@google-cloud/synthetics-sdk-mocha` to create a Google Cloud Function that can be used with Google Cloud Monitoring Synthetics.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `URL` variable in the `./mocha_tests.spec.js` file to your url.

## Running 

The following command runs this sample locally
```
npx functions-framework --target=SyntheticMochaSuite
```

The following command deploys this sample to gcp as a cloud function.
```
gcloud functions deploy nodejs-http-function --gen2 --runtime=nodejs18 --region=us-central1 --source=. --entry-point=SyntheticMochaSuite --trigger-http
```

## Running Local Synthetics SDK Changes

Use the following instructions to run the version of the synthetics-sdk-mocha package that has local changes. *The instructions should start from the root directory for the `synthetics-sdk` workspace.*

1. Pack "@google-cloud/synthetics-sdk-api" into tar file, output to synthetics-sdk-mocha
```
npm pack --workspace="@google-cloud/synthetics-sdk-api" --pack-destination=packages/synthetics-sdk-mocha/
cd packages/synthetics-sdk-mocha/
```

2. Open package.json, update synthetics-sdk-mocha dependency for "@google-cloud/synthetics-sdk-api" to use tar file.

```
"dependencies": {
    ...
    "@google-cloud/synthetics-sdk-api": "google-cloud-synthetics-sdk-api-1.0.0.tgz"
    ...
}
```

3. Go back to root directory of synthetics-sdk
```
cd ../..
```

4. Pack all workspace packages into tar files, output to samples/mocha-url-ok
```
npm pack --workspaces --pack-destination=samples/mocha-url-ok/
cd samples/mocha-url-ok/
```

5. Open package.json, update mocha-url-ok dependency for "@google-cloud/synthetics-sdk-mocha" to use tar file.
```
"dependencies": {
    ...
    "@google-cloud/synthetics-sdk-mocha": "google-cloud-synthetics-sdk-mocha-1.0.0.tgz"
    ...
}
```

Proceed back to steps in [RUNNING](#Running)
