import { test, expect } from '../../fixtures/customFixtures';

test.describe('Verify Email Page', () => {
  test.beforeEach(async ({ verifyEmailPage }) => {
    await verifyEmailPage.navigate();
  });

  test('should render the verification screen', async ({ verifyEmailPage }) => {
    await expect(verifyEmailPage.pageTitle).toBeVisible();
    await expect(verifyEmailPage.verifiedBtn).toBeVisible();
    await expect(verifyEmailPage.resendBtn).toBeVisible();
  });
});
