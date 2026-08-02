import { test, expect } from '../../fixtures/customFixtures';

test.describe('Planner Page', () => {
  test.beforeEach(async ({ plannerPage }) => {
    await plannerPage.navigate();
  });

  test('should load the planner with habit and goal tabs', async ({ plannerPage }) => {
    await expect(plannerPage.pageTitle).toBeVisible();
    await expect(plannerPage.habitsTab).toBeVisible();
    await expect(plannerPage.goalsTab).toBeVisible();
    await expect(plannerPage.newItemBtn).toBeVisible();
  });

  test('should create a new habit', async ({ plannerPage }) => {
    await plannerPage.switchToHabits();
    const habitName = `E2E Habit ${Date.now()}`;
    await plannerPage.createHabit(habitName);
    await expect(plannerPage.getHabitCard(habitName)).toBeVisible();
  });

  test('should create a new goal', async ({ plannerPage }) => {
    await plannerPage.switchToGoals();
    const goalTitle = `E2E Goal ${Date.now()}`;
    await plannerPage.createGoal(goalTitle, '2027-12-31', 'Health');
    await expect(plannerPage.getGoalCard(goalTitle)).toBeVisible();
  });

  test('should switch between daily habits and long-term goals tabs', async ({ plannerPage }) => {
    await plannerPage.switchToGoals();
    await expect(plannerPage.goalsTab).toHaveClass(/bg-white/);
    await plannerPage.switchToHabits();
    await expect(plannerPage.habitsTab).toHaveClass(/bg-white/);
  });
});
