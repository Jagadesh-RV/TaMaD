const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);

router.get('/', (req, res) => {
  const reminders = getDb().prepare(`
    SELECT r.*, t.title as task_title FROM reminders r
    LEFT JOIN tasks t ON t.id = r.task_id
    WHERE r.user_id=? ORDER BY r.remind_at
  `).all(req.user.id);
  res.json({ reminders });
});

router.post('/', (req, res) => {
  const { task_id, remind_at, message } = req.body;
  if (!remind_at) return res.status(400).json({ error: 'remind_at required' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO reminders (id, task_id, user_id, remind_at, message) VALUES (?, ?, ?, ?, ?)')
    .run(id, task_id || null, req.user.id, remind_at, message || null);
  res.status(201).json({ reminder: { id, task_id, remind_at, message } });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM reminders WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;