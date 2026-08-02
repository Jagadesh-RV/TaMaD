import { test, expect } from '../../fixtures/customFixtures';

test.describe('AI Assistant Page', () => {
  test.beforeEach(async ({ aiAssistantPage }) => {
    await aiAssistantPage.navigate();
  });

  test('should load with chat and parser tabs', async ({ aiAssistantPage }) => {
    await expect(aiAssistantPage.pageTitle).toBeVisible();
    await expect(aiAssistantPage.chatTab).toBeVisible();
    await expect(aiAssistantPage.parserTab).toBeVisible();
  });

  test('should show the chat empty state with suggested prompts', async ({ aiAssistantPage }) => {
    await expect(aiAssistantPage.chatEmptyHeader).toBeVisible();
    await expect(aiAssistantPage.suggestedPrompts.summarize).toBeVisible();
    await expect(aiAssistantPage.suggestedPrompts.report).toBeVisible();
    await expect(aiAssistantPage.suggestedPrompts.overdue).toBeVisible();
    await expect(aiAssistantPage.suggestedPrompts.tips).toBeVisible();
    await expect(aiAssistantPage.chatTextarea).toBeVisible();
  });

  test('should prefill the chat input from a suggested prompt', async ({ aiAssistantPage }) => {
    await aiAssistantPage.clickSuggestedPrompt('summarize');
    await expect(aiAssistantPage.chatTextarea).toHaveValue('Summarize my tasks for today');
  });

  test('should switch to the task parser tab', async ({ aiAssistantPage }) => {
    await aiAssistantPage.switchToParser();
    await expect(aiAssistantPage.parseTextarea).toBeVisible();
    await expect(aiAssistantPage.parseBtn).toBeVisible();
    await expect(aiAssistantPage.parsedResultHeader).toBeVisible();
    await expect(aiAssistantPage.parsedResultEmpty).toBeVisible();
  });

  test('should allow entering natural language input', async ({ aiAssistantPage }) => {
    await aiAssistantPage.switchToParser();
    await aiAssistantPage.fillParseInput('Create a report for next week with high priority');
    await expect(aiAssistantPage.parseTextarea).toHaveValue('Create a report for next week with high priority');
    await expect(aiAssistantPage.parseBtn).toBeEnabled();
  });
});
