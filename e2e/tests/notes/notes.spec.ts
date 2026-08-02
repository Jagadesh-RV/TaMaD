import { test, expect } from '../../fixtures/customFixtures';

test.describe('Notes Page', () => {
  test.beforeEach(async ({ notesPage }) => {
    await notesPage.navigate();
  });

  test('should load the knowledge base and show the editor or empty state', async ({ page, notesPage }) => {
    await expect(notesPage.knowledgeBaseHeader).toBeVisible();

    // If no notes exist, we should see the empty state; otherwise the editor loads
    if (await notesPage.emptyState.isVisible()) {
      await expect(notesPage.emptyState).toBeVisible();
    } else {
      await expect(notesPage.editorTitleInput).toBeVisible();
      await expect(notesPage.autoSavedLabel).toBeVisible();
    }
  });

  test('should create a new note', async ({ notesPage }) => {
    const noteTitle = `E2E Note ${Date.now()}`;
    await notesPage.createNote(noteTitle);

    // The newly created note becomes the active document
    await expect(notesPage.editorTitleInput).toHaveValue(noteTitle);
    await expect(notesPage.getNoteItem(noteTitle)).toBeVisible();
  });

  test('should edit note title and content with autosave', async ({ notesPage }) => {
    const noteTitle = `Editable Note ${Date.now()}`;
    await notesPage.createNote(noteTitle);
    await expect(notesPage.editorTitleInput).toHaveValue(noteTitle);

    const updatedTitle = `${noteTitle} Updated`;
    await notesPage.editTitle(updatedTitle);
    await expect(notesPage.editorTitleInput).toHaveValue(updatedTitle);

    await notesPage.editContent('E2E content updated via autosave');
    await expect(notesPage.editorContentTextarea).toHaveValue('E2E content updated via autosave');
    await expect(notesPage.autoSavedLabel).toBeVisible();
  });
});
