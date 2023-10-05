const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const installScriptPath = path.join(__dirname, '..', 'node_modules', 'puppeteer', 'install.mjs');

if (fs.existsSync(installScriptPath)) {
  console.log('Running puppeteer install.mjs...');
  execSync(`node ${installScriptPath}`, { stdio: 'inherit' });
} else {
  console.log('puppeteer install.mjs not found. Skipping...');
}
