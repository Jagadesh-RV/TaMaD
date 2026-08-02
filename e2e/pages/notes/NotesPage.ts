import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NotesPage extends BasePage {
  readonly knowledgeBaseHeader: Locator;
  readonly newNoteBtn: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;

  // Modal locators
  readonly modalTitleInput: Locator;
  readonly createNoteBtn: Locator;

  // Editor locators
  readonly editorTitleInput: Locator;
  readonly editorContentTextarea: Locator;
  readonly autoSavedLabel: Locator;

  constructor(page: Page) {
    super(page, '/notes');
    this.knowledgeBaseHeader = page.locator('h2', { hasText: 'Knowledge Base' });
    this.newNoteBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    this.searchInput = page.getByPlaceholder('Search docs...');
    this.emptyState = page.locator('text=No notes yet. Click + to create one.');

    // Modal
    this.modalTitleInput = page.getByPlaceholder('e.g., Q3 Meeting Notes');
    this.createNoteBtn = page.getByRole('button', { name: 'Create Note' });

    // Editor
    this.editorTitleInput = page.getByPlaceholder('Untitled Document');
    this.editorContentTextarea = page.getByPlaceholder('Start writing...');
    this.autoSavedLabel = page.locator('text=Auto-saved');
  }

  async clickNewNote() {
    await this.newNoteBtn.click();
  }

  async createNote(title: string) {
    await this.clickNewNote();
    await this.modalTitleInput.waitFor({ state: 'visible' });
    await this.modalTitleInput.fill(title);
    await this.createNoteBtn.click();
  }

  getNoteItem(title: string): Locator {
    // The note list renders each doc title inside a <h3> button
    return this.page.locator('h3', { hasText: title });
  }

  async selectNote(title: string) {
    await this.getNoteItem(title).click();
  }

  async editTitle(title: string) {
    await this.editorTitleInput.fill(title);
  }

  async editContent(content: string) {
    await this.editorContentTextarea.fill(content);
  }
}
