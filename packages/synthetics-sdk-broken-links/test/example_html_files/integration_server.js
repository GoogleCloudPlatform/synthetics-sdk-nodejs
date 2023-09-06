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

const functions = require('@google-cloud/functions-framework');
const SyntheticsSdkBrokenLinks = require('synthetics-sdk-broken-links');
const path = require('path');

/*
 * This is the server template that is required to run a synthetic monitor in
 * Google Cloud Functions.
 */
const okOptions = {
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/retrieve_links_test.html'
  )}`
};
const invalidOptions = {
  origin_url: `file:${path.join(
    __dirname,
    '../example_html_files/retrieve_links_test.html'
  )}`,
  link_order: 'incorrect'
};

functions.http('BrokenLinksDefaultsOk', async (req, res) => {
  res.send(await SyntheticsSdkBrokenLinks.runBrokenLinks(okOptions));
});

functions.http('BrokenLinksInvalidOptionsNotOk', async (req, res) => {
  res.send(await SyntheticsSdkBrokenLinks.runBrokenLinks(invalidOptions));
});


functions.http('BrokenLinksDefaultsHandlerOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler(okOptions));

functions.http('BrokenLinksInvalidOptionsHandlerNotOk', SyntheticsSdkBrokenLinks.runBrokenLinksHandler(invalidOptions));

functions.http('HomeDepot', async (req, res) => {
  const options = {
    origin_url: 'https://www.homedepot.com/b/Lighting-Lamps/N-5yc1vZc7pd?NCNI-5&searchRedirect=lamps&semanticToken=i10r20200f2200000000_2023082016375008507612338204_us-east1-kpkc%20i10r20200f2200000000%20%3E%20rid%3A%7B263addb7611158a2c3db7c164a20cc2f%7D%3Arid%20st%3A%7Blamps%7D%3Ast%20ml%3A%7B24%7D%3Aml%20pt%3A%7Blamp%7D%3Apt%20nr%3A%7Blamp%7D%3Anr%20nf%3A%7Bn%2Fa%7D%3Anf%20qu%3A%7Blamp%7D%3Aqu%20ie%3A%7B0%7D%3Aie%20qr%3A%7Blamp%7D%3Aqr',
    get_attributes: ['href', 'src'],
    query_selector_all: 'a, img',
    link_limit: 5
  };

  res.send(await SyntheticsSdkBrokenLinks.runBrokenLinks(options));
});

