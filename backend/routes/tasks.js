const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');
const { getSocket } = require('../services/socketService');

router.use(authenticate);

// Helper to include standard relations
const taskIncludes = {
  tags: { include: { tag: true } },
  subtasks: {
    include: {
      tags: { include: { tag: true } }
    },
    orderBy: { position: 'asc' }
  }
};

// GET all tasks
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, tag, search, date, roadmap_id } = req.query;

    const where = {
      userId: req.user.id,
      parentId: null,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(roadmap_id && { roadmapId: roadmap_id }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      }),
      ...(tag && {
        tags: { some: { tagId: tag } }
      })
    };

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.dueDate = { gte: d, lt: nextDay };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: taskIncludes,
      orderBy: [
        { isPinned: 'desc' },
        { position: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ tasks });
  } catch (err) { next(err); }
});

// GET single task
router.get('/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: taskIncludes
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) { next(err); }
});

// CREATE task
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status = 'todo', priority = 'medium', due_date, scheduled_at,
      estimated_minutes = 30, tags = [], parent_id, recurrence, recurrence_end,
      roadmap_id, milestone } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const maxPosTask = await prisma.task.findFirst({
      where: { userId: req.user.id, parentId: parent_id || null },
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    const position = (maxPosTask?.position || 0) + 1;

    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: due_date ? new Date(due_date) : null,
      scheduledAt: scheduled_at ? new Date(scheduled_at) : null,
      estimatedMinutes: estimated_minutes,
      recurrence,
      recurrenceEnd: recurrence_end ? new Date(recurrence_end) : null,
      position,
      roadmapId: roadmap_id,
      milestone,
      userId: req.user.id,
      parentId: parent_id || null,
    };

    if (tags && tags.length > 0) {
      taskData.tags = {
        create: tags.map(tagId => ({ tagId }))
      };
    }

    const task = await prisma.task.create({
      data: taskData,
      include: taskIncludes
    });

    const io = getSocket();
    if (io) io.to(req.user.id).emit('task:created', task);

    res.status(201).json({ task });
  } catch (err) { next(err); }
});

// UPDATE task
router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    const { title, description, status, priority, due_date, scheduled_at,
      estimated_minutes, actual_minutes, tags, is_pinned, recurrence,
      recurrence_end, roadmap_id, milestone } = req.body;

    let completedAt = existing.completedAt;
    if (status === 'done' && existing.status !== 'done') completedAt = new Date();
    if (status && status !== 'done') completedAt = null;

    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { dueDate: due_date ? new Date(due_date) : null }),
      ...(scheduled_at !== undefined && { scheduledAt: scheduled_at ? new Date(scheduled_at) : null }),
      ...(estimated_minutes !== undefined && { estimatedMinutes: estimated_minutes }),
      ...(actual_minutes !== undefined && { actualMinutes: actual_minutes }),
      ...(is_pinned !== undefined && { isPinned: is_pinned }),
      ...(recurrence !== undefined && { recurrence }),
      ...(recurrence_end !== undefined && { recurrenceEnd: recurrence_end ? new Date(recurrence_end) : null }),
      ...(roadmap_id !== undefined && { roadmapId: roadmap_id }),
      ...(milestone !== undefined && { milestone }),
      ...(completedAt !== undefined && { completedAt }),
    };

    if (tags !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: req.params.id } });
      if (tags.length > 0) {
        updateData.tags = {
          create: tags.map(tagId => ({ tagId }))
        };
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: taskIncludes
    });

    const io = getSocket();
    if (io) io.to(req.user.id).emit('task:updated', task);

    res.json({ task });
  } catch (err) { next(err); }
});

// DELETE task
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.id } });

    const io = getSocket();
    if (io) io.to(req.user.id).emit('task:deleted', { id: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
});

// Reorder tasks
router.patch('/reorder/bulk', async (req, res, next) => {
  try {
    const { order } = req.body; // [{ id, position }]
    await prisma.$transaction(
      order.map(item => 
        prisma.task.updateMany({
          where: { id: item.id, userId: req.user.id },
          data: { position: item.position }
        })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) { next(err); }
});

// Focus session start/end
router.post('/:id/focus', async (req, res, next) => {
  try {
    const { action, duration_minutes = 25 } = req.body;
    
    if (action === 'start') {
      const session = await prisma.focusSession.create({
        data: {
          userId: req.user.id,
          taskId: req.params.id,
          durationMinutes: duration_minutes,
          startedAt: new Date()
        }
      });
      return res.json({ session_id: session.id });
    }
    
    if (action === 'end') {
      const { session_id, completed } = req.body;
      await prisma.focusSession.updateMany({
        where: { id: session_id, userId: req.user.id },
        data: {
          endedAt: new Date(),
          completed: !!completed
        }
      });
      return res.json({ message: 'Session ended' });
    }
    
    res.status(400).json({ error: 'action must be start or end' });
  } catch (err) { next(err); }
});

module.exports = router;