import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WhiteboardPage extends BasePage {
  readonly createWhiteboardBtn: Locator;
  readonly boardSelector: Locator;
  readonly canvas: Locator;

  // Tool palette buttons
  readonly selectToolBtn: Locator;
  readonly penToolBtn: Locator;
  readonly squareToolBtn: Locator;
  readonly circleToolBtn: Locator;
  readonly eraserToolBtn: Locator;

  // Modal locators
  readonly modalTitleInput: Locator;
  readonly createBoardBtn: Locator;

  constructor(page: Page) {
    super(page, '/whiteboard');
    this.createWhiteboardBtn = page.getByRole('button', { name: '+ Create Whiteboard' });
    this.boardSelector = page.locator('select');
    this.canvas = page.locator('svg');

    // The tool buttons have no accessible name, so we match by their SVG icon class
    this.selectToolBtn = page.locator('button').filter({ has: page.locator('svg.lucide-mouse-pointer-2') }).first();
    this.penToolBtn = page.locator('button').filter({ has: page.locator('svg.lucide-pen') }).first();
    this.squareToolBtn = page.locator('button').filter({ has: page.locator('svg.lucide-square') }).first();
    this.circleToolBtn = page.locator('button').filter({ has: page.locator('svg.lucide-circle') }).first();
    this.eraserToolBtn = page.locator('button').filter({ has: page.locator('svg.lucide-eraser') }).first();

    // Modal
    this.modalTitleInput = page.getByPlaceholder('e.g., Q4 Brainstorming');
    this.createBoardBtn = page.getByRole('button', { name: 'Create Whiteboard' });
  }

  async clickCreateWhiteboard() {
    await this.createWhiteboardBtn.click();
  }

  async createWhiteboard(title: string) {
    await this.clickCreateWhiteboard();
    await this.modalTitleInput.waitFor({ state: 'visible' });
    await this.modalTitleInput.fill(title);
    await this.createBoardBtn.click();
  }

  getBoardOption(title: string): Locator {
    return this.boardSelector.locator('option', { hasText: title });
  }

  async selectBoard(title: string) {
    await this.boardSelector.selectOption({ label: title });
  }

  async drawStroke() {
    const box = await this.canvas.boundingBox();
    if (!box) throw new Error('Whiteboard canvas not found');
    const startX = box.x + box.width / 2 - 50;
    const startY = box.y + box.height / 2;
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + 100, startY + 60, { steps: 10 });
    await this.page.mouse.up();
  }
}
