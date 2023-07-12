const puppeteer = require('puppeteer');

/**
* Creates a dictionary mapping non-2xx links' target URLs to their respective status codes.
* @param {linksResult} An array of link objects with targetUrl and statusCode properties.
* @returns The dictionary mapping target URLs to non-2xx status codes as a string.
*/
function createNon2xxLinksDictionary(linksResult) {
  const non2xxLinks = {}; // possibly repeating

  for (const link of linksResult) {
    const statusCode = link.statusCode;
    const targetUrl = link.targetUrl;

    if (statusCode < 200 || statusCode >= 300) {
      non2xxLinks[targetUrl] = statusCode;
    }
  }

  const stringified_dict = Object.entries(non2xxLinks).map(([key, value]) => `${key}:${value}`).join(", ");

  return "Non 2xx Links: " + stringified_dict;
}

/**
 * Retrieves all links on the page using Puppeteer, removing duplicate links and
 * those ending with '#', to ensure reliable navigation within Puppeteer.
 *
 * @param {Page} page - The Puppeteer page instance to retrieve the links from.
 * @returns {Array<string>} - An array of the target URLs as strings.
 */
async function retrieveLinks(page) {
  let links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(anchor => anchor.href);
  });

  // Filter out duplicate links and remove trailing "#"
  links = links
    .filter((link, i) => links.indexOf(link) === i)
    .map(link => link.replace(/#$/, ''));

  return links;
}


/**
 * Checks the status of `maxNumberOfFollowedLinks` links scraped on `.startUrl`
 * webpage leveraging Puppeteer.
 *
 * @param {string} startUrl - The starting URL to check the links on.
 * @param {number} maxNumberOfFollowedLinks - The number of links to check.
 * @param {number} maxTimeout - The maximum timeout for each link request in ms.
 * @returns {Promise<Array<Object>>} - Array of link status results.
 */
async function checkLinks(startUrl, maxNumberOfFollowedLinks, maxTimeout) {
  const browser = await puppeteer.launch({
    headless: "new"
  })
  const page = await browser.newPage();
  const linksToReturn = [];
  const linksToCheck = [];

  page.setDefaultNavigationTimeout(maxTimeout);

  // load initial page, return any error in LinkResult format
  try {
    // Navigate to the URL and wait for the page to finish loading
    const parentResponse = await page.goto(
      startUrl,
      { waitUntil: 'load', timeout: maxTimeout });
    linksToReturn.push({
      targetUrl: startUrl,
      statusCode: parentResponse.status(),
    });

  } catch (error) {
    const error_message =
      'Could not successfully navigate to startUrl. Error: ' + error.message;
    throw new Error(error_message);
  };

  // retrive all links from page
  try {
    linksToCheck.push(...await retrieveLinks(page));
  } catch (error) {
    const error_message =
      'Could not successfully retrieve links. Error: ' + error.message;
    throw new Error(error_message);
  }

  linksToCheck.splice(maxNumberOfFollowedLinks);

  for (const targetLink of linksToCheck) {
    try {
      const response = await page.goto(
        targetLink,
        { waitUtil: 'domcontentloaded', timeout: maxTimeout }
      );

      linksToReturn.push({
        targetUrl: targetLink,
        statusCode: response.status(),
      });
    } catch (error) {
      linksToReturn.push({
        targetUrl: targetLink,
        statusCode: null
      });
    }
  }

  await browser.close();
  return linksToReturn;
}


/*
 * crawls links and returns a dictionary mapping failing (non2xx) links' target
 * URLs to their respective status codes.
 *
 * @param {string} startUrl - The starting URL to check the links on.
 * @param {number} maxNumberOfFollowedLinks - The number of links to check.
 * @param {number} maxTimeout - The maximum timeout for each link request in ms
 *
 * @returns {Promise<Object>} - A dictionary mapping failing (non2xx) links'
 *        target URLs to their respective status codes.
 */
async function crawl(startUrl, maxNumberOfFollowedLinks = 30, maxTimeout = 5000) {
  const linksResult = await checkLinks(startUrl, maxNumberOfFollowedLinks, maxTimeout);
  return createNon2xxLinksDictionary(linksResult);
}

module.exports = { crawl }
