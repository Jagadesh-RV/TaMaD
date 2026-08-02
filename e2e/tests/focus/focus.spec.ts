import { test, expect } from '../../fixtures/customFixtures';

test.describe('Focus Page', () => {
  test.beforeEach(async ({ focusPage }) => {
    await focusPage.navigate();
  });

  test('should load the focus timer with presets', async ({ focusPage }) => {
    await expect(focusPage.pageTitle).toBeVisible();
    await expect(focusPage.timerDisplay).toBeVisible();
    await expect(focusPage.playBtn).toBeVisible();
    await expect(focusPage.presetPomodoro).toBeVisible();
    await expect(focusPage.presetLong).toBeVisible();
    await expect(focusPage.presetShort).toBeVisible();
    await expect(focusPage.focusTipsHeader).toBeVisible();
  });

  test('should default to the Pomodoro work timer', async ({ focusPage }) => {
    // 25 minutes in work mode = 25:00
    await expect(focusPage.timerDisplay).toHaveText('25:00');
  });

  test('should switch timer presets', async ({ focusPage }) => {
    await focusPage.selectPreset('Short');
    await expect(focusPage.timerDisplay).toHaveText('15:00');

    await focusPage.selectPreset('Long');
    await expect(focusPage.timerDisplay).toHaveText('50:00');
  });

  test('should switch between work and break modes', async ({ focusPage }) => {
    await focusPage.switchToBreak();
    // Break for the Pomodoro preset is 5 minutes
    await expect(focusPage.timerDisplay).toHaveText('05:00');

    await focusPage.switchToWork();
    await expect(focusPage.timerDisplay).toHaveText('25:00');
  });

  test('should start, pause, and reset the timer', async ({ focusPage }) => {
    const initial = await focusPage.getTimerText();

    await focusPage.startTimer();
    await expect(focusPage.timerDisplay).not.toHaveText(initial as string);

    await focusPage.pauseTimer();
    const paused = await focusPage.getTimerText();
    // Value stays frozen while paused
    await expect(focusPage.timerDisplay).toHaveText(paused as string);

    await focusPage.resetTimer();
    await expect(focusPage.timerDisplay).toHaveText(initial as string);
  });
});
