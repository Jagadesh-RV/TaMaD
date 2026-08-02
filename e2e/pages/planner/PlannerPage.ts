import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PlannerPage extends BasePage {
  readonly pageTitle: Locator;
  readonly habitsTab: Locator;
  readonly goalsTab: Locator;
  readonly newItemBtn: Locator;
  readonly habitsEmptyState: Locator;
  readonly goalsEmptyState: Locator;

  // Habit modal locators
  readonly habitModalTitle: Locator;
  readonly habitNameInput: Locator;
  readonly saveHabitBtn: Locator;

  // Goal modal locators
  readonly goalModalTitle: Locator;
  readonly goalTitleInput: Locator;
  readonly goalTypeSelect: Locator;
  readonly goalTargetDateInput: Locator;
  readonly saveGoalBtn: Locator;

  constructor(page: Page) {
    super(page, '/planner');
    this.pageTitle = page.locator('h1', { hasText: 'Planner & Habits' });
    this.habitsTab = page.getByRole('button', { name: 'Daily Habits' });
    this.goalsTab = page.getByRole('button', { name: 'Long-Term Goals' });
    this.newItemBtn = page.getByRole('button', { name: /New (Habit|Goal)/ });
    this.habitsEmptyState = page.locator('text=No habits yet. Create one to start building consistency!');
    this.goalsEmptyState = page.locator('text=No goals yet. Set a long-term goal to track!');

    // Habit modal
    this.habitModalTitle = page.locator('h2', { hasText: 'New Habit' });
    this.habitNameInput = page.getByPlaceholder('e.g., Drink 2L water');
    this.saveHabitBtn = page.getByRole('button', { name: 'Save Habit' });

    // Goal modal
    this.goalModalTitle = page.locator('h2', { hasText: 'New Goal' });
    this.goalTitleInput = page.getByPlaceholder('e.g., Launch MVP');
    this.goalTypeSelect = page.locator('select').first();
    this.goalTargetDateInput = page.locator('input[type="date"]').first();
    this.saveGoalBtn = page.getByRole('button', { name: 'Save Goal' });
  }

  async switchToHabits() {
    await this.habitsTab.click();
  }

  async switchToGoals() {
    await this.goalsTab.click();
  }

  async createHabit(name: string) {
    await this.newItemBtn.click();
    await this.habitNameInput.waitFor({ state: 'visible' });
    await this.habitNameInput.fill(name);
    await this.saveHabitBtn.click();
  }

  async createGoal(title: string, targetDate: string, type = 'Professional') {
    await this.newItemBtn.click();
    await this.goalTitleInput.waitFor({ state: 'visible' });
    await this.goalTitleInput.fill(title);
    await this.goalTypeSelect.selectOption({ label: type });
    await this.goalTargetDateInput.fill(targetDate);
    await this.saveGoalBtn.click();
  }

  getHabitCard(name: string): Locator {
    return this.page.locator('h3', { hasText: name });
  }

  getGoalCard(title: string): Locator {
    return this.page.locator('h3', { hasText: title });
  }
}
