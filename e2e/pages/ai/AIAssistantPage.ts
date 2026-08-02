import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class AIAssistantPage extends BasePage {
  readonly pageTitle: Locator;
  readonly chatTab: Locator;
  readonly parserTab: Locator;

  // Workspace Chat
  readonly chatTextarea: Locator;
  readonly sendBtn: Locator;
  readonly chatEmptyHeader: Locator;
  readonly suggestedPrompts: Record<string, Locator>;

  // Task Parser
  readonly parseTextarea: Locator;
  readonly parseBtn: Locator;
  readonly parsedResultHeader: Locator;
  readonly parsedResultEmpty: Locator;

  constructor(page: Page) {
    super(page, '/ai');
    this.pageTitle = page.locator('h1', { hasText: 'AI Assistant' });
    this.chatTab = page.getByRole('button', { name: /Workspace Chat/ });
    this.parserTab = page.getByRole('button', { name: /Task Parser/ });

    // Chat
    this.chatTextarea = page.getByPlaceholder('Ask about your workspace...');
    this.sendBtn = page.locator('button[class*="btn-primary"]').filter({ has: page.locator('svg.lucide-send') }).first();
    this.chatEmptyHeader = page.locator('h3', { hasText: 'AI Workspace Assistant' });
    this.suggestedPrompts = {
      summarize: page.getByRole('button', { name: /Summarize today/ }),
      report: page.getByRole('button', { name: /Generate report/ }),
      overdue: page.getByRole('button', { name: /Overdue tasks/ }),
      tips: page.getByRole('button', { name: /Productivity tips/ }),
    };

    // Parser
    this.parseTextarea = page.getByPlaceholder('Describe your task in natural language...');
    this.parseBtn = page.getByRole('button', { name: /Parse Task/ });
    this.parsedResultHeader = page.locator('h3', { hasText: 'Parsed Result' });
    this.parsedResultEmpty = page.locator('text=Enter text on the left to see the parsed task.');
  }

  async switchToChat() {
    await this.chatTab.click();
  }

  async switchToParser() {
    await this.parserTab.click();
  }

  async sendChatMessage(message: string) {
    await this.chatTextarea.fill(message);
    await this.sendBtn.click();
  }

  async fillParseInput(text: string) {
    await this.parseTextarea.fill(text);
  }

  async clickSuggestedPrompt(prompt: 'summarize' | 'report' | 'overdue' | 'tips') {
    await this.suggestedPrompts[prompt].click();
  }

  getChatMessage(text: string): Locator {
    return this.page.locator('p.whitespace-pre-wrap', { hasText: text });
  }
}
