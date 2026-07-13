const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);

router.get('/', (req, res) => {
  const db = getDb();
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  const unread = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND read=0').get(req.user.id).c;
  res.json({ notifications, unread });
});

router.patch('/read-all', (req, res) => {
  getDb().prepare('UPDATE notifications SET read=1 WHERE user_id=?').run(req.user.id);
  res.json({ message: 'All read' });
});

router.patch('/:id/read', (req, res) => {
  getDb().prepare('UPDATE notifications SET read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Read' });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;