# GCM Synthetics e2e testing

This folder contains a test runner for local changes to any of the packages distributed under `@google-cloud/synthetics-sdk-nodejs`, as well as continuous validation against already distributed packages. These scenarios are all ran within synthetics that target GCFv2's, with passing / failing correctness measured using alert policies, all spun up using terraform in a GCP project.

### tl;dr of how this folder works...
* A script (`./e2e/generate_test_servers.sh`) is used to generate code that is valid when deploying against GCFv2, and uses package distributions local to the repository, as well as versions distributed on npm.
* Cloud build is used to
  * (a) Spin up "golden" synthetics against different versions of each distributed synthetics-sdk packages, and creates alerts against them to ensure that they continue to work.
  * (b) Spin up temporary synthetics against local versions of the syntehtics-sdk packages, runs tests against them to ensure they work correctly, and tears down the infrastructure.

### Prerequisite Project Setup

The following GCS buckets need to exist on your project to persist information about terraform resources

```bash
$ gsutil mb gs://synthetics-sdk-golden-tf
$ gsutil mb gs://synthetics-sdk-testing-tf
$ gsutil versioning set on gs://synthetics-sdk-testing-tf
$ gsutil versioning set on gs://synthetics-sdk-golden-tf
```

The following permissions need to be provided to the cloud build service account
```
$ gcloud projects add-iam-policy-binding $PROJECT_ID     --member serviceAccount:$CLOUDBUILD_SA --role roles/editor
$ gcloud functions add-iam-policy-binding local-cloud-build --member serviceAccount:$CLOUDBUILD_SA --role=roles/cloudfunctions.invoker
```

A notification channel should be created that will be used for when golden and test synthetics fail or pass(incorrectly). 

### Running "locally" on Cloud Build

All scenarios should be ran from the root of the repository.

Managing "golden" synthetics. 

```
# Turns up
$ NOTIFICATION_CHANNEL=<<alerts when golden fails>>
$ gcloud builds submit --region=us-central1 --config ./e2e/cloudbuild-golden.yaml --substitutions=_NOTIFICATION_CHANNEL="${NOTIFICATION_CHANNEL}" .
# Turns down
$ gcloud builds submit --region=us-central1 --config ./e2e/cloudbuild-local-cleanup.yaml --substitutions=_WORKSPACE_ID="golden-prod" .
```


```
# Spins up synthetics against local versions of synthetics-sdk packages,
# ensures they pass / fail as expected, and turns them down.
$ gcloud builds submit --region=us-central1 --config ./e2e/cloudbuild-local-test.yaml .

# Spins up permanent synthetics w/ alerts
$ gcloud builds submit --region=us-central1 --config ./e2e/cloudbuild-golden.yaml .
```
