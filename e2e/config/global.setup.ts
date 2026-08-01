import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  
  // Use a fallback test user
  const email = process.env.TEST_USER_EMAIL || 'teste2e@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'password123';

  // Attempt login
  await loginPage.fillInputByLabel('Email', email);
  await loginPage.fillInputByLabel('Password', password);
  await loginPage.clickButtonByText('Sign in to TaMaD');

  // If login fails (e.g. user not found), we might want to route to register and register them
  // For now, we just wait for Dashboard. 
  // NOTE: If you need to register the user first, run the register test or add logic here.
  
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  } catch (error) {
    console.warn('Login failed, attempting to register...');
    await page.goto('/register');
    await page.getByLabel('Full Name').fill('E2E Test User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Create Account', exact: true }).click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  // End of authentication steps
  await page.context().storageState({ path: authFile });
});
