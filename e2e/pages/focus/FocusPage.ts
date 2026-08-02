import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FocusPage extends BasePage {
  readonly pageTitle: Locator;
  readonly sessionsBadge: Locator;
  readonly timerDisplay: Locator;
  readonly playBtn: Locator;
  readonly pauseBtn: Locator;
  readonly resetBtn: Locator;
  readonly workModeBtn: Locator;
  readonly breakModeBtn: Locator;
  readonly presetPomodoro: Locator;
  readonly presetLong: Locator;
  readonly presetShort: Locator;
  readonly focusTipsHeader: Locator;

  constructor(page: Page) {
    super(page, '/focus');
    this.pageTitle = page.locator('h1', { hasText: 'Focus Mode' });
    this.sessionsBadge = page.locator('div', { hasText: /sessions today/ });
    this.timerDisplay = page.locator('.font-mono.text-7xl');
    this.playBtn = page.locator('button[class*="rounded-full"]').filter({ has: page.locator('svg.lucide-play') }).first();
    this.pauseBtn = page.locator('button[class*="rounded-full"]').filter({ has: page.locator('svg.lucide-pause') }).first();
    this.resetBtn = page.locator('button').filter({ has: page.locator('svg.lucide-rotate-ccw') }).first();
    this.workModeBtn = page.getByRole('button', { name: 'work' });
    this.breakModeBtn = page.getByRole('button', { name: 'break' });
    this.presetPomodoro = page.getByRole('button', { name: /Pomodoro/ });
    this.presetLong = page.getByRole('button', { name: /Long/ });
    this.presetShort = page.getByRole('button', { name: /Short/ });
    this.focusTipsHeader = page.locator('h3', { hasText: 'Focus Tips' });
  }

  async startTimer() {
    await this.playBtn.click();
  }

  async pauseTimer() {
    await this.pauseBtn.click();
  }

  async resetTimer() {
    await this.resetBtn.click();
  }

  async switchToWork() {
    await this.workModeBtn.click();
  }

  async switchToBreak() {
    await this.breakModeBtn.click();
  }

  async selectPreset(preset: 'Pomodoro' | 'Long' | 'Short') {
    if (preset === 'Pomodoro') await this.presetPomodoro.click();
    else if (preset === 'Long') await this.presetLong.click();
    else await this.presetShort.click();
  }

  getTimerText(): Promise<string | null> {
    return this.timerDisplay.textContent();
  }
}
