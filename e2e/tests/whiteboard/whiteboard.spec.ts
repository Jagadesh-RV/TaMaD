import { test, expect } from '../../fixtures/customFixtures';

test.describe('Whiteboard Page', () => {
  test.beforeEach(async ({ whiteboardPage }) => {
    await whiteboardPage.navigate();
  });

  test('should load the whiteboard canvas or show create button', async ({ page, whiteboardPage }) => {
    // If no boards exist, a "Create Whiteboard" CTA is shown
    if (await whiteboardPage.createWhiteboardBtn.isVisible()) {
      await expect(whiteboardPage.createWhiteboardBtn).toBeVisible();
    } else {
      await expect(whiteboardPage.boardSelector).toBeVisible();
      await expect(whiteboardPage.penToolBtn).toBeVisible();
      await expect(whiteboardPage.canvas).toBeVisible();
    }
  });

  test('should create a new whiteboard', async ({ whiteboardPage }) => {
    const boardTitle = `E2E Board ${Date.now()}`;
    await whiteboardPage.createWhiteboard(boardTitle);

    // The new board becomes active in the selector and canvas is shown
    await expect(whiteboardPage.boardSelector).toHaveValue(/^[a-f0-9]{24}$/);
    await expect(whiteboardPage.getBoardOption(boardTitle)).toBeVisible();
    await expect(whiteboardPage.canvas).toBeVisible();
  });

  test('should draw a stroke on the canvas', async ({ page, whiteboardPage }) => {
    const boardTitle = `Drawable Board ${Date.now()}`;
    await whiteboardPage.createWhiteboard(boardTitle);
    await expect(whiteboardPage.canvas).toBeVisible();

    // Drawing with the pen tool should render a stroke on the canvas
    await whiteboardPage.penToolBtn.click();
    await whiteboardPage.drawStroke();

    await expect(whiteboardPage.canvas.locator('path')).toHaveCount(1);
  });
});
