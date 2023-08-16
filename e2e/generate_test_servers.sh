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

npm install

synthetics_sdk_api_pack_file=$(npm pack --workspace @google-cloud/synthetics-sdk-api --pack-destination e2e)
synthetics_sdk_mocha_pack_file=$(npm pack --workspace @google-cloud/synthetics-sdk-mocha --pack-destination e2e)

cd e2e

# For each directory under ./e2e/test_servers...
# Create a directory under ./e2e/generated
# Copy the test server to that directory
# Copy the packed synthetic sdk to the directory
# If a given sdk is a dependency, set package.json to use the packed sdk
for d in $(find ./test_servers/ -mindepth 2 -maxdepth 2 -type d -printf '%P\n' -o -type l -printf '%P\n'); do
	generated_dir="./generated/local/${d}"
	echo Generating ${generated_dir}
	mkdir -p ${generated_dir}
	cp -r ./test_servers/${d}/* ${generated_dir}
	cp ${synthetics_sdk_api_pack_file} ${generated_dir}
        cp ${synthetics_sdk_mocha_pack_file} ${generated_dir}
        sed -i '/synthetics-sdk-api/c\\"@google-cloud\/synthetics-sdk-api\": \"'${synthetics_sdk_api_pack_file}'\"' ${generated_dir}/package.json
        sed -i '/synthetics-sdk-mocha/c\\"@google-cloud\/synthetics-sdk-mocha\": \"'${synthetics_sdk_mocha_pack_file}'\"' ${generated_dir}/package.json
done

# For each directory under ./e2e/test_servers/synthetics-sdk-api
# For each distributed version of @google-cloud/synthetics-sdk-api
# Create a directory under ./e2e/generated/synthetics-sdk-api-<<version>>
# Copy the test_server to that directory
# Update the sdk dependency, set package.json to use the version of the sdk
for d in $(find ./test_servers/synthetics-sdk-api/ -mindepth 1 -maxdepth 1 -type d -printf '%P\n' -o -type l -printf '%P\n'); do
	for v in $(npm view @google-cloud/synthetics-sdk-api versions --json | jq -r 'if type == "string" then [.] else . end' | jq -r '.[]'); do
		generated_dir="./generated/synthetics-sdk-api/synthetics-sdk-api-${v}/${d}"
		echo Generating ${generated_dir}
		mkdir -p ${generated_dir}
		cp -r ./test_servers/synthetics-sdk-api/${d}/* ${generated_dir}
		sed -i '/synthetics-sdk-api/c\\"@google-cloud\/synthetics-sdk-api\": \"'^${v}'\"' ${generated_dir}/package.json
	done
done

# For each directory under ./e2e/test_servers/synthetics-sdk-mocha
# For each distributed version of @google-cloud/synthetics-sdk-mocha
# Create a directory under ./e2e/generated/synthetics-sdk-mocha-<<version>>
# Copy the test_server to that directory
# Update the sdk dependency, set package.json to use the version of the sdk
for d in $(find ./test_servers/synthetics-sdk-mocha/ -mindepth 1 -maxdepth 1 -type d -printf '%P\n' -o -type l -printf '%P\n'); do
        for v in $(npm view @google-cloud/synthetics-sdk-mocha versions --json | jq -r 'if type == "string" then [.] else . end' | jq -r '.[]'); do
                generated_dir="./generated/synthetics-sdk-mocha/synthetics-sdk-mocha-${v}/${d}"
		echo Generating ${generated_dir}
                mkdir -p ${generated_dir}
                cp -r ./test_servers/synthetics-sdk-mocha/${d}/* ${generated_dir}
                sed -i '/synthetics-sdk-mocha/c\\"@google-cloud\/synthetics-sdk-mocha\": \"'^${v}'\"' ${generated_dir}/package.json
        done
done

# Zip each generated directory so that it can be deployed on GCF
for d in $(find ./generated/ -mindepth 3 -maxdepth 3 -type d); do
	echo zipping ${d}
	cd ${d}
	zip -qr gcf-source *
	cd -
done
