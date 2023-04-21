# Synthetics SDK API

As long as a Google Cloud Function exposes an http endpoint that complies with the API spec as defined in the Synthetics SDK API package, the Cloud Function will work as a target for the Synthetic Monitor.

This is predominantly important if you want to run a programmatic workflow for which other SyntheticSDK's, such as Synthetic SDK Mocha, are not a good fit.

This package includes a proto definition that contains the api spec, as well as typescript types that are generated from that proto.

# Installation

```
npm install --save @google-cloud/synthetics-sdk-api
```

# Usage

This usage example assumes a valid codebase setup for typescript and Cloud Functions, see [example](https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/typescript.md).

```bash
$ npm install --save @google-cloud/synthetics-sdk-mocha
# This example uses...
# * node-fetch#2.x for http requests
$ npm install --save node-fetch
```

`index.ts`
```typescript
import * as ff from '@google-cloud/functions-framework';
import {SyntheticResult, GenericResultV1} from '@google-cloud/synthetics-sdk-api';
import fetch from 'node-fetch';

const syntheticCode = async () => {
    // PUT YOUR SYNTHETIC CODE HERE
    const url = '<<YOUR URL HERE>>'; // URL to send the request to
    return await fetch(url);
}

ff.http('SyntheticFunction', async (req: ff.Request, res: ff.Response) => {
    const syntheticResult: SyntheticResult = {
      runtime_metadata: {}
    };

    try {
      await syntheticCode();
      const synthetic_generic_result: GenericResultV1 = {
            ok: true
        };

      syntheticResult.synthetic_generic_result_v1 = synthetic_generic_result;
    } catch (err: unknown) {
      const synthetic_generic_result: GenericResultV1 = {
        ok: false
      };

      if (err instanceof Error) {
        synthetic_generic_result.error = {
          error_name: err?.name,
          error_message: err?.message,
          file_name: 'index.ts',
        }
      }
      syntheticResult.synthetic_generic_result_v1 = synthetic_generic_result;
    }

    res.send(syntheticResult);
});
```

### Create Function and Synthetic Monitor

Deploy function using gcloud
```bash
$ gcloud functions deploy <<service-name>> --gen2 --runtime=nodejs18 --region=<<region>> --source=. --entry-point=SyntheticFunction --trigger-http
```

The created function may now be used within the Google Cloud Monitoring Synthetics product, where you may set up periodic invocation of the function, who's output will result in metrics, logs, and alerts based off of the response from the function.

# Useful Links

* For documentation regarding Google Cloud Monitoring Synthetics, visit [cloud.google.com/monitoring/](https://cloud.google.com/monitoring/)
* For documentation on Cloud Functions, visit [https://cloud.google.com/functions](https://cloud.google.com/functions/docs/concepts/version-comparison#new-in-2nd-gen)