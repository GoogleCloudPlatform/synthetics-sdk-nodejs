import { join } from 'path';
import { Configuration } from 'puppeteer';

const puppeteerConfig: Configuration = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

export default puppeteerConfig;
