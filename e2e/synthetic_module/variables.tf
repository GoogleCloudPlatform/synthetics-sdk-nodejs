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

variable "name" {
  description = "The name that is used for identifying a given synthetics function and uptime check"
  type        = string
}
variable "project_id" {
  description = "The ID of the project in which to provision resources."
  type        = string
}
variable "notification_channel" {
  description = "The notification channel used for created alert policies"
  type        = string
  default     = ""
}
variable "function_source" {
  description = "The location of the zip file containing the source code"
  type        = string
}
variable "runtime" {
  description = "The runtime / language version that is used when turning up the cloud function"
  type        = string
  default     = "nodejs16"
}
variable "entry_point" {
  description = "The entry point for the cloud function"
  type        = string
}
variable "passing" {
  description = "Whether or not the synthetic should be passing or failing, with an alerting policy that alerts on the incorrect behavior from being observed"
  type        = bool
}
variable "service_account_email" {
  description = "If provided, the self-provided service account to run the function with"
  type        = string
  default     = "synthetic-monitoring@synthetic-os-build-pipeline.iam.gserviceaccount.com"
}
