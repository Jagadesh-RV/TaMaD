const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = getDb();
  const roadmaps = db.prepare('SELECT * FROM roadmaps WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  const enriched = roadmaps.map(r => {
    const tasks = db.prepare("SELECT id, title, status, milestone, due_date, priority FROM tasks WHERE roadmap_id=? ORDER BY position").all(r.id);
    const done = tasks.filter(t => t.status === 'done').length;
    return { ...r, tasks, progress: tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0 };
  });
  res.json({ roadmaps: enriched });
});

router.post('/', (req, res) => {
  const { title, description, start_date, end_date, color = '#6366f1' } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = uuidv4();
  getDb().prepare('INSERT INTO roadmaps (id, user_id, title, description, start_date, end_date, color) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, description || null, start_date || null, end_date || null, color);
  res.status(201).json({ roadmap: { id, title, description, start_date, end_date, color } });
});

router.patch('/:id', (req, res) => {
  const { title, description, start_date, end_date, color } = req.body;
  getDb().prepare('UPDATE roadmaps SET title=COALESCE(?,title), description=COALESCE(?,description), start_date=COALESCE(?,start_date), end_date=COALESCE(?,end_date), color=COALESCE(?,color), updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?')
    .run(title, description, start_date, end_date, color, req.params.id, req.user.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM roadmaps WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;