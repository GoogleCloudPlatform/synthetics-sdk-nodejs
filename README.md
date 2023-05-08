# Synthetics SDK Node

Google Cloud Monitoring Synthetics allow you to observe and track application performance by issuing simulated requests and actions to your applications from GCP data centers located around the world. Synthetic monitoring can proactively help application owners detect faulty behavior such as unexpected changes in behavior, an increaese in latency, and changes in response status codes.

Google Cloud Monitoring Synthetics target a Cloud Functions 2nd gen, which is periodically invoked to ensure that the behavior that is monitored in code continue to work as expected. 

The packages in this repository support the authoring of Cloud Functions v2 that may be provided to the Google Cloud Monitoring Synthetics product.

## Synthetics SDK Mocha

```
npm install --save @google-cloud/syntetics-sdk-mocha
```

The Synthetics SDK Mocha is a framework that runs a provided mocha test suite, and returns a response that may be consumed by the Google Cloud Monitoring Synthetics.

See [README.md](packages/synthetics-sdk-mocha/README.md) for installation and usage information.

## Synthetics SDK API

```
npm install --save @google-cloud/syntetics-sdk-api
```

As long as a Google Cloud Function exposes an http endpoint that complies with the API spec as defined in the Synthetics SDK API package, the Cloud Function will work as a target for the Synthetic Monitor. The Synthetics SDK API package includes a proto definition that contains the api spec, as well as typescript types that are generated from that proto.

See [README.md](packages/synthetics-sdk-api/README.md) for installation and usage information.