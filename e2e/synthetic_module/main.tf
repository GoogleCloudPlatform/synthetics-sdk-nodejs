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

provider "google-beta" {
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

resource "google_monitoring_uptime_check_config" "synthetic_monitor" {
    provider = google-beta

    display_name = "${var.name}-${terraform.workspace}"
    timeout = "60s"

    synthetic_monitor {
        cloud_function_v2 {
	    name = google_cloudfunctions2_function.default.id
	}
    }
}

resource "google_monitoring_alert_policy" "synthetic_check" {
    count = var.notification_channel == "" ? 0 : 1
    display_name = "${var.name}-${terraform.workspace}"
    conditions {
	display_name = var.passing ? "${var.name}-${terraform.workspace}-passing" : "${var.name}-${terraform.workspace}-failing"
	condition_threshold {
	    filter = "resource.type = \"cloud_run_revision\" AND metric.type = \"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.labels.check_id = \"${split("/", google_monitoring_uptime_check_config.synthetic_monitor.name)[3]}\""
	    duration = "60s"
	    comparison = "COMPARISON_GT"
	    threshold_value = 1
	    trigger {
		count = 1
	    }
	    aggregations {
		alignment_period = "2400s"
		cross_series_reducer = var.passing ? "REDUCE_COUNT_FALSE" : "REDUCE_COUNT_TRUE"
		group_by_fields = ["resource.label.*"]
		per_series_aligner = "ALIGN_NEXT_OLDER"
	    }
	}
    }
    notification_channels = [var.notification_channel]
    combiner = "OR"
}

output "function_name" {
	value = google_cloudfunctions2_function.default.id
}

