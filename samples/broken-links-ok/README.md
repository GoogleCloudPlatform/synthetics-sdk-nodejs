# Overview

This sample uses the `@google-cloud/synthetics-sdk-broken-links` to create a Google Cloud Function that can be used with Google Cloud Monitoring Synthetics.

## Installation

```
# from root of repo, build all packages
npm install
```

Update the `options` variable in the `index.js` to the desired `origin_uri` along with any other (optional) fields.

## Running

The following command runs this sample locally
```
npx functions-framework --target=BrokenLinkChecker
```

The following command deploys this sample to gcp as a cloud function.
```
gcloud functions deploy broken-links-http --gen2 --runtime=nodejs18 --region=us-east4 --source=. --entry-point=BrokenLinkChecker --trigger-http --timeout=60 --memory=2048M
```

## Running Local Synthetics SDK Changes

Use the following instructions to run the version of the synthetics-sdk-broken-links package that has local changes. *The instructions should start from the root directory for the `synthetics-sdk` workspace.*

1. Pack "@google-cloud/synthetics-sdk-api" into tar file, output to synthetics-sdk-broken-links
```
npm pack --workspace="@google-cloud/synthetics-sdk-api" --pack-destination=packages/synthetics-sdk-broken-links/
cd packages/synthetics-sdk-broken-links/
```

2. Open package.json, update synthetics-sdk-broken-links dependency for "@google-cloud/synthetics-sdk-api" to use tar file.

```
"dependencies": {
    ...
    "@google-cloud/synthetics-sdk-api": "google-cloud-synthetics-sdk-api-0.5.0.tgz"
    ...
}
```

3. Go back to root directory of synthetics-sdk
```
cd ../..
```

4. Pack all workspace packages into tar files, output to samples/broken-links-ok
```
npm pack --workspaces --pack-destination=samples/broken-links-ok/
cd samples/broken-links-ok/
```

5. Open package.json, update broken-links-ok dependency for "@google-cloud/synthetics-sdk-broken-links" and "@google-cloud/synthetics-sdk-api" to use tar file.
```
"dependencies": {
    ...
    "@google-cloud/synthetics-sdk-broken-links": "google-cloud-synthetics-sdk-broken-links-0.1.2.tgz",
    "@google-cloud/synthetics-sdk-api": "google-cloud-synthetics-sdk-api-0.5.0.tgz"
    ...
}
```

Proceed back to steps in [RUNNING](#Running)
