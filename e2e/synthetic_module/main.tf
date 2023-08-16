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
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.34.0"
    }
  }
}

provider "google" {
  project = var.project_id
}

resource "random_string" "default" {
  length = 8
  special = false
  upper = false
  keepers = {
    md5 = filemd5(var.function_source)
  }
}

resource "google_storage_bucket" "default" {
  name                        = "${var.name}-${random_string.default.result}-gcf-src" # Every bucket name must be globally unique input?
  location                    = "US"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "object" {
  name   = "function-source-${random_string.default.result}.zip"
  bucket = google_storage_bucket.default.name
  source = var.function_source
}

resource "google_cloudfunctions2_function" "default" {
  name        = "${var.name}-${terraform.workspace}"
  location    = "us-central1"
  description = "created using terraform config"

  build_config {
    runtime     = var.runtime
    entry_point = var.entry_point
    source {
      storage_source {
        bucket = google_storage_bucket.default.name
        object = google_storage_bucket_object.object.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
  }
}

output "function_name" {
  value = google_cloudfunctions2_function.default.id
}

# This is a curl that creates an uptime check. This is not idempotent since were not using
# the terraform resource, so every time this script runs, this will be recreated.
# See this github issue that covers how to create an uptime check with an alerting condition:
# https://github.com/hashicorp/terraform-provider-google/issues/3133

# data "http" "create_synthetic_monitor" {
#   url    = "https://monitoring.googleapis.com/v3/projects/${var.project_id}/uptimeCheckConfigs"
#  method = "POST"

#  request_headers = {
#    Accept = "application/json"
#    Authorization = "Bearer ${var.http_auth_token}"
#  }

#  request_body = <<EOF
#{
#"displayName": "${var.name}",
#"synthetic_monitor": {
#"cloud_function_v2": {
#"name": "${google_cloudfunctions2_function.default.id}"
#}
#}
#}
#EOF
#}

#output "uptime_check_config_id" {
#  value = jsondecode(data.http.create_synthetic_monitor.body).name
#}
