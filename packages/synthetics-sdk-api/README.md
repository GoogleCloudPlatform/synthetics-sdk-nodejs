# Synthetics SDK API

As long as a Google Cloud Function exposes an http endpoint that complies with the API spec as defined in the Synthetics SDK API package, the Cloud Function will work as a target for a Synthetic Monitor.

This is predominantly important if you want to run a programmatic workflow for which other SyntheticSDK's, such as Synthetic SDK Mocha, are not a good fit.

This package includes a proto definition that contains the api spec, as well as typescript types that are generated from that proto.

# Installation

```
npm install --save @google-cloud/synthetics-sdk-api
```

# Useful Links

* For a sample in plain nodejs, see [generic-synthetic-nodejs](../../samples/generic-synthetic-nodejs/)
* For a sample using typescript, see [generic-synthetic-typescript](../../samples/generic-synthetic-typescript/)
* For documentation regarding Google Cloud Monitoring Synthetics, visit [cloud.google.com/monitoring/](https://cloud.google.com/monitoring/)
* For documentation on Cloud Functions, visit [https://cloud.google.com/functions](https://cloud.google.com/functions/docs/concepts/version-comparison#new-in-2nd-gen)