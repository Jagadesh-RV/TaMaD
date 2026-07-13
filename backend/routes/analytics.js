const express = require('express');
const router = express.Router();
const { getDb } = require('../models/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Dashboard summary
router.get('/summary', (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const total = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND parent_id IS NULL").get(uid).c;
  const done = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status='done' AND parent_id IS NULL").get(uid).c;
  const inprogress = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status='in_progress' AND parent_id IS NULL").get(uid).c;
  const todo = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status='todo' AND parent_id IS NULL").get(uid).c;
  const overdue = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND status!='done' AND due_date < ? AND parent_id IS NULL").get(uid, today).c;
  const todayDue = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND DATE(due_date)=? AND parent_id IS NULL").get(uid, today).c;
  const pinned = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE user_id=? AND is_pinned=1").get(uid).c;

  // Streak calculation
  const completions = db.prepare("SELECT DATE(completed_at) as d FROM tasks WHERE user_id=? AND status='done' AND completed_at IS NOT NULL ORDER BY completed_at DESC").all(uid);
  let streak = 0;
  const uniqueDays = [...new Set(completions.map(c => c.d))];
  const todayDate = new Date(today);
  for (let i = 0; i < uniqueDays.length; i++) {
    const d = new Date(uniqueDays[i]);
    const diff = Math.floor((todayDate - d) / 86400000);
    if (diff === i) streak++;
    else break;
  }

  res.json({ total, done, inprogress, todo, overdue, todayDue, pinned, streak, completionRate: total > 0 ? Math.round((done / total) * 100) : 0 });
});

// Completion trend (last 30 days)
router.get('/trend', (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const days = parseInt(req.query.days) || 30;

  const rows = db.prepare(`
    SELECT DATE(completed_at) as date, COUNT(*) as completed
    FROM tasks
    WHERE user_id=? AND status='done' AND completed_at >= DATE('now', '-${days} days')
    GROUP BY DATE(completed_at)
    ORDER BY date
  `).all(uid);

  // Fill gaps
  const map = {};
  rows.forEach(r => map[r.date] = r.completed);
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, completed: map[key] || 0 });
  }
  res.json({ trend: result });
});

// Priority breakdown
router.get('/priority', (req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT priority, COUNT(*) as count FROM tasks WHERE user_id=? AND parent_id IS NULL GROUP BY priority").all(req.user.id);
  res.json({ priority: rows });
});

// Tag distribution
router.get('/tags', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT tg.name, tg.color, COUNT(*) as count
    FROM task_tags tt
    JOIN tags tg ON tg.id = tt.tag_id
    JOIN tasks t ON t.id = tt.task_id
    WHERE t.user_id=?
    GROUP BY tg.id
    ORDER BY count DESC
  `).all(req.user.id);
  res.json({ tags: rows });
});

// Productivity heatmap (contributions per day for a year)
router.get('/heatmap', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT DATE(completed_at) as date, COUNT(*) as count
    FROM tasks
    WHERE user_id=? AND status='done' AND completed_at >= DATE('now', '-365 days')
    GROUP BY DATE(completed_at)
  `).all(req.user.id);
  res.json({ heatmap: rows });
});

// Focus sessions stats
router.get('/focus', (req, res) => {
  const db = getDb();
  const uid = req.user.id;
  const total = db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(duration_minutes),0) as mins FROM focus_sessions WHERE user_id=? AND completed=1").get(uid);
  const weekly = db.prepare("SELECT DATE(started_at) as date, COALESCE(SUM(duration_minutes),0) as mins FROM focus_sessions WHERE user_id=? AND started_at >= DATE('now','-7 days') GROUP BY DATE(started_at)").all(uid);
  res.json({ totalSessions: total.c, totalMinutes: total.mins, weekly });
});

// Time estimation accuracy
router.get('/estimation', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT estimated_minutes, actual_minutes
    FROM tasks
    WHERE user_id=? AND status='done' AND actual_minutes > 0
    ORDER BY completed_at DESC LIMIT 50
  `).all(req.user.id);
  res.json({ estimation: rows });
});

module.exports = router;