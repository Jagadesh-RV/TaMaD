const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);

// Export tasks as CSV
router.get('/export/csv', (req, res) => {
  const db = getDb();
  const { from, to, status } = req.query;
  let query = 'SELECT t.*, GROUP_CONCAT(tg.name) as tags FROM tasks t LEFT JOIN task_tags tt ON tt.task_id=t.id LEFT JOIN tags tg ON tg.id=tt.tag_id WHERE t.user_id=? AND t.parent_id IS NULL';
  const params = [req.user.id];
  if (from) { query += ' AND t.created_at >= ?'; params.push(from); }
  if (to) { query += ' AND t.created_at <= ?'; params.push(to); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  query += ' GROUP BY t.id ORDER BY t.created_at DESC';

  const tasks = db.prepare(query).all(...params);

  const headers = ['ID', 'Title', 'Status', 'Priority', 'Due Date', 'Created', 'Completed', 'Estimated (min)', 'Actual (min)', 'Tags'];
  const rows = tasks.map(t => [
    t.id, `"${(t.title || '').replace(/"/g, '""')}"`, t.status, t.priority,
    t.due_date || '', t.created_at || '', t.completed_at || '',
    t.estimated_minutes || '', t.actual_minutes || '',
    `"${(t.tags || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="tamad-report-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// Export as JSON
router.get('/export/json', (req, res) => {
  const db = getDb();
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.setHeader('Content-Disposition', `attachment; filename="tamad-backup-${new Date().toISOString().split('T')[0]}.json"`);
  res.json({ exported_at: new Date().toISOString(), user: req.user.name, tasks });
});

// Weekly summary report
router.get('/weekly', (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const created = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND created_at >= DATE('now','-7 days')").get(uid).c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status='done' AND completed_at >= DATE('now','-7 days')").get(uid).c;
  const overdue = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status!='done' AND due_date < DATE('now') AND due_date >= DATE('now','-7 days')").get(uid).c;
  const byPriority = db.prepare("SELECT priority, COUNT(*) as count FROM tasks WHERE user_id=? AND created_at >= DATE('now','-7 days') GROUP BY priority").all(uid);
  const topTags = db.prepare(`SELECT tg.name, COUNT(*) as c FROM task_tags tt JOIN tags tg ON tg.id=tt.tag_id JOIN tasks t ON t.id=tt.task_id WHERE t.user_id=? AND t.created_at >= DATE('now','-7 days') GROUP BY tg.id ORDER BY c DESC LIMIT 5`).all(uid);
  const dailyActivity = db.prepare(`SELECT DATE(created_at) as date, COUNT(*) as created FROM tasks WHERE user_id=? AND created_at >= DATE('now','-7 days') GROUP BY DATE(created_at)`).all(uid);

  res.json({ period: '7 days', created, completed, overdue, completionRate: created > 0 ? Math.round((completed/created)*100) : 0, byPriority, topTags, dailyActivity });
});

module.exports = router;