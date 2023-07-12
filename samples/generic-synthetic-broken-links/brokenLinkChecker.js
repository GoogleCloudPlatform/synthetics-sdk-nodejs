const puppeteer = require('puppeteer');

/**
 * Creates a dictionary of links that have a non-2xx status code (mapped to their respective status codes).
 * @param {Array} An array of link objects with targetUrl and statusCode properties.
 * @throws {Error} If any links have a non-2xx status code.
 */
function createNon2xxLinksDictionary(linksResult) {
  const non2xxLinks = {};

  for (const link of linksResult) {
    const statusCode = link.statusCode;
    const targetUrl = link.targetUrl;

    if (statusCode < 200 || statusCode >= 300) {
      non2xxLinks[targetUrl] = statusCode;
    }
  }

  if (Object.keys(non2xxLinks).length === 0) {
    return;
  } else {
    const stringified_dict = Object.entries(non2xxLinks).map(([key, value]) => `${key}:${value}`).join(", ");
    throw new Error("Non 2xx Links: " + stringified_dict);
  }
}

/**
 * Retrieves all links on the page using Puppeteer, removing duplicate links and
 * those ending with '#', to ensure reliable navigation within Puppeteer. Only follow links that start with http or https
 *
 * @param {Page} page - The Puppeteer page instance to retrieve the links from.
 * @returns {Array<string>} - An array of the target URLs as strings.
 */
async function retrieveLinks(page) {
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors.map(anchor => anchor.href);
  });

  // Filter out duplicate links and remove trailing "#"
  const filteredLinks = [...new Set(
    links.map(link => link.toString().replace(/#$/, ''))
  )].filter(link => link.startsWith('http') || link.startsWith('https'));

  return filteredLinks;
}


/**
 * Checks the status of `maxNumberOfFollowedLinks` links scraped on `startUrl`
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
  let page = await browser.newPage();
  const linksToReturn = [];
  const linksToCheck = [];

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

  page = await browser.newPage();
  page.setCacheEnabled(false); // prevents 304 errors
  page.setDefaultNavigationTimeout(maxTimeout);

  for (const targetLink of linksToCheck) {
    try {
      const response = await page.goto(
        targetLink,
        { waitUtil: 'load', timeout: maxTimeout }
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
 */
async function runBrokenLinks(startUrl, maxNumberOfFollowedLinks = 30, maxTimeout = 5000) {
  const linksResult = await checkLinks(startUrl, maxNumberOfFollowedLinks, maxTimeout);
  createNon2xxLinksDictionary(linksResult);
}

module.exports = { runBrokenLinks }
