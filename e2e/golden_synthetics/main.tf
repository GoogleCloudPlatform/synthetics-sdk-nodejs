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
    bucket = "synthetics-golden-tf"
  }
}

# The following modules spin up synthetics to be tested for correctness.
module "synthetics-sdk-api-010-functional-ok" {
  source = "../synthetic_module/"  
  name = "sdk-api-010-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-api/synthetics-sdk-api-0.1.0/functional-synthetics-sdk-api/gcf-source.zip"
  entry_point = "SyntheticOk"
}

module "synthetics-sdk-api-010-functional-not-ok" {
  source = "../synthetic_module/"
  name = "sdk-api-010-not-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-api/synthetics-sdk-api-0.1.0/functional-synthetics-sdk-api/gcf-source.zip"
  entry_point = "SyntheticNotOk"
}

module "synthetics-sdk-mocha-010-functional-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-010-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-mocha/synthetics-sdk-mocha-0.1.0/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticOk"
}

module "synthetics-sdk-mocha-010-functional-not-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-010-not-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-mocha/synthetics-sdk-mocha-0.1.0/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticNotOk"
}

module "synthetics-sdk-mocha-011-functional-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-011-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-mocha/synthetics-sdk-mocha-0.1.0/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticOk"
}

module "synthetics-sdk-mocha-011-functional-not-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-011-not-ok"
  project_id = var.project_id
  function_source = "../generated/local/synthetics-sdk-mocha/functional-synthetics-sdk-mocha/gcf-source.zip"
  entry_point = "SyntheticNotOk"
}

module "synthetics-sdk-api-sample-010-generic-synthetic-nodejs" {
  source = "../synthetic_module/"
  name = "sdk-api-010-generic-synthetic-nodejs"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-api/synthetics-sdk-api-0.1.0/generic-synthetic-nodejs/gcf-source.zip"
  entry_point = "SyntheticFunction"
}

module "synthetics-sdk-api-sample-010-generic-synthetic-typescript" {
  source = "../synthetic_module/"
  name = "sdk-api-010-generic-synthetic-ts"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-api/synthetics-sdk-api-0.1.0/generic-synthetic-typescript/gcf-source.zip"
  entry_point = "SyntheticFunction"
}

module "synthetics-sdk-mocha-sample-010-mocha-url-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-010-mocha-url-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-mocha/synthetics-sdk-mocha-0.1.0/mocha-url-ok/gcf-source.zip"
  entry_point = "SyntheticMochaSuite"
}

module "synthetics-sdk-mocha-sample-011-mocha-url-ok" {
  source = "../synthetic_module/"
  name = "sdk-mocha-011-mocha-url-ok"
  project_id = var.project_id
  function_source = "../generated/synthetics-sdk-mocha/synthetics-sdk-mocha-0.1.1/mocha-url-ok/gcf-source.zip"
  entry_point = "SyntheticMochaSuite"
}
