// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START monitoring_synthetic_monitoring_custom_selenium_script]
const {
  instantiateAutoInstrumentation,
  runSyntheticHandler,
} = require('@google-cloud/synthetics-sdk-api');
// Run instantiateAutoInstrumentation before any other code runs, to get automatic logs and traces
instantiateAutoInstrumentation();
const functions = require('@google-cloud/functions-framework');
const assert = require('node:assert');

const { Builder, Browser, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/*
 * This function executes the synthetic code for testing purposes.
 * If the code runs without errors, the synthetic test is considered successful.
 * If an error is thrown during execution, the synthetic test is considered failed.
 */
functions.http(
  'CustomSeleniumSynthetic',
  runSyntheticHandler(async ({ logger, executionId }) => {
    /*
     * Construct chrome options
     * Note: `setChromeBinaryPath` must be set to '/srv/bin/chromium' when running in
     *   GCF (but will need to be changed if running on local machine).
     */
    const options = new chrome.Options();
    options.setChromeBinaryPath('/srv/bin/chromium');
    options.addArguments('--headless', '--disable-gpu', '--no-sandbox');

    // Launch headless chrome webdriver with options
    const driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();

    // Navigate to the target URL
    await driver.get('https://example.com');

    // Retrieve title and `a` tag of page
    const title = await driver.getTitle();
    const aTag = await driver.findElement(By.css('a')).getText();

    // assert title is as expected and print to console
    await assert.equal(title, 'Example Domain');
    logger.info(`My URL title is: ${title} ` + executionId);

    await driver.quit();
  })
);

// [END monitoring_synthetic_monitoring_custom_selenium_script]
