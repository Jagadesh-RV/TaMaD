import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Habit from '../models/Habit';
import { cache, CACHE_KEYS } from '../utils/cache';

export const getHabits = async (req: AuthRequest, res: Response) => {
  const { workspaceId } = req.query;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const habits = await Habit.find({ workspaceId, userId: req.user._id });
  res.json(habits);
};

export const createHabit = async (req: AuthRequest, res: Response) => {
  const { name, description, frequency, targetDays, color, workspaceId } = req.body;
  if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
  const habit = await Habit.create({
    name, description, frequency, targetDays, color, workspaceId, userId: req.user._id
  });
  await cache.invalidatePattern(CACHE_KEYS.HABITS(workspaceId));
  res.status(201).json(habit);
};

export const updateHabit = async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  
  if (habit.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Not authorized to update this habit' });
  }

  const { name, description, frequency, targetDays, color } = req.body;
  if (name !== undefined) habit.name = name;
  if (description !== undefined) habit.description = description;
  if (frequency !== undefined) habit.frequency = frequency;
  if (targetDays !== undefined) habit.targetDays = targetDays;
  if (color !== undefined) habit.color = color;

  await habit.save();
  await cache.invalidatePattern(CACHE_KEYS.HABITS(habit.workspaceId.toString()));
  res.json(habit);
};

export const toggleHabitDate = async (req: AuthRequest, res: Response) => {
  const { date } = req.body;
  const habit = await Habit.findById(req.params.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  
  const targetDate = new Date(date).setHours(0,0,0,0);
  const existsIndex = habit.completedDates.findIndex(d => d.getTime() === targetDate);
  
  if (existsIndex > -1) {
    habit.completedDates.splice(existsIndex, 1);
  } else {
    habit.completedDates.push(new Date(targetDate));
  }
  
  await habit.save();
  await cache.invalidatePattern(CACHE_KEYS.HABITS(habit.workspaceId.toString()));
  res.json(habit);
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
  const habit = await Habit.findById(req.params.id);
  if (!habit) return res.status(404).json({ error: 'Habit not found' });
  await habit.deleteOne();
  await cache.invalidatePattern(CACHE_KEYS.HABITS(habit.workspaceId.toString()));
  res.json({ message: 'Habit removed' });
};
