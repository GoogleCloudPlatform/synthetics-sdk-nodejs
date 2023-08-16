# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

terraform {
  backend "gcs" {
    bucket = "synthetics-sdk-testing-tf"
    prefix = "dev"
  }
}

# The following modules spin up synthetics to be tested for correctness.
module "synthetics-sdk-api-functional-ok" {
  source = "../synthetic_module/"  
  name = "sdk-api-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-api/functional-synthetics-sdk-api/gcf-source.zip"
  entry_point = "SyntheticOk"
}

module "synthetics-sdk-api-functional-not-ok" {
  source = "../synthetic_module/"
  name = "sdk-api-not-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-api/functional-synthetics-sdk-api/gcf-source.zip"
  entry_point = "SyntheticNotOk"
}

module "synthetics-sdk-mocha-functional-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-mocha/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticOk"
}

module "synthetics-sdk-mocha-functional-not-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-not-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-mocha/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticNotOk"
}

# The following modules spin up provided samples as a smoke test.
module "synthetics-sdk-api-sample-generic-synthetic-nodejs" {
  source = "../synthetic_module/"
  name = "sdk-api-generic-synthetic-nodejs"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-api/generic-synthetic-nodejs/gcf-source.zip"
  entry_point = "SyntheticFunction"
}

module "synthetics-sdk-api-sample-generic-synthetic-typescript" {
  source = "../synthetic_module/"
  name = "sdk-api-generic-synthetic-ts"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-api/generic-synthetic-typescript/gcf-source.zip"
  entry_point = "SyntheticFunction"
}

module "synthetics-sdk-mocha-sample-mocha-url-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-mocha-url-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-mocha/mocha-url-ok/gcf-source.zip"
  entry_point = "SyntheticMochaSuite"
}
