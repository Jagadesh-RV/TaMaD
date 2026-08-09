const { chromium } = require('playwright');

async function checkConsole() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to landing page...');
  await page.goto(process.argv[2] || 'http://localhost:5173/');
  
  console.log('Waiting for a bit...');
  await page.waitForTimeout(3000);

  await browser.close();
  console.log('Done.');
}

checkConsole().catch(console.error);
