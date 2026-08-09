const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log("Navigating to login...");
  await page.goto('http://localhost:5173/login');
  
  // Try to login
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for dashboard...");
  await page.waitForURL('**/agile/dashboard', { timeout: 10000 }).catch(() => console.log("Timeout waiting for dashboard URL"));
  await page.waitForTimeout(2000); // Let UI settle

  console.log("Taking Dashboard screenshot...");
  await page.screenshot({ path: path.join(imagesDir, 'hero-dashboard.png') });
  
  console.log("Navigating to Personal Workspace (Notes)...");
  await page.goto('http://localhost:5173/notes');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imagesDir, 'personal-workspace.png') });

  console.log("Navigating to Team Workspace (Teams)...");
  await page.goto('http://localhost:5173/agile/teams');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imagesDir, 'team-workspace.png') });

  console.log("Navigating to Agile Engine (Sprint Planning)...");
  await page.goto('http://localhost:5173/agile/planning');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imagesDir, 'agile-engine.png') });

  console.log("Navigating to AI Assistant...");
  await page.goto('http://localhost:5173/ai-assistant');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imagesDir, 'ai-automation.png') });

  console.log("Navigating to Meetings...");
  await page.goto('http://localhost:5173/meetings');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(imagesDir, 'meetings.png') });

  console.log("Done!");
  await browser.close();
})();
