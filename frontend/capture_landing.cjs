const { chromium } = require('playwright');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to landing page...');
  await page.goto(process.argv[2] || 'http://localhost:5173/');
  
  console.log('Waiting for network idle...');
  await page.waitForLoadState('networkidle');

  console.log('Taking full page screenshot...');
  await page.screenshot({ path: process.argv[3] || 'landing_page.png', fullPage: true });
  
  await browser.close();
  console.log('Done.');
}

capture().catch(console.error);
