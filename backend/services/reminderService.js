const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/database');
const { getSocket } = require('./socketService');

function startReminderJob() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    try {
      const db = getDb();
      const now = new Date();
      const nowStr = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM

      const due = db.prepare(`
        SELECT r.*, t.title as task_title
        FROM reminders r
        LEFT JOIN tasks t ON t.id = r.task_id
        WHERE r.sent = 0 AND SUBSTR(r.remind_at, 1, 16) <= ?
      `).all(nowStr);

      for (const reminder of due) {
        // Mark as sent
        db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);

        // Create in-app notification
        const notifId = uuidv4();
        const title = reminder.message || `Reminder: ${reminder.task_title || 'Task due'}`;
        db.prepare('INSERT INTO notifications (id, user_id, title, body, type, task_id) VALUES (?, ?, ?, ?, ?, ?)')
          .run(notifId, reminder.user_id, '⏰ Reminder', title, 'reminder', reminder.task_id);

        // Push via Socket.IO
        const io = getSocket();
        if (io) {
          io.to(reminder.user_id).emit('notification', {
            id: notifId,
            title: '⏰ Reminder',
            body: title,
            type: 'reminder',
            task_id: reminder.task_id,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Check for tasks due today that have no reminder
      const todayStr = now.toISOString().split('T')[0];
      const dueToday = db.prepare(`
        SELECT t.*, u.id as user_id FROM tasks t
        JOIN users u ON u.id = t.user_id
        WHERE DATE(t.due_date) = ? AND t.status != 'done' AND t.parent_id IS NULL
      `).all(todayStr);

      for (const task of dueToday) {
        // Only notify once per day — check if notification already sent today
        const exists = db.prepare(`
          SELECT id FROM notifications WHERE user_id=? AND task_id=? AND DATE(created_at)=?
        `).get(task.user_id, task.id, todayStr);
        if (!exists && now.getHours() === 9 && now.getMinutes() === 0) {
          const notifId = uuidv4();
          db.prepare('INSERT INTO notifications (id, user_id, title, body, type, task_id) VALUES (?, ?, ?, ?, ?, ?)')
            .run(notifId, task.user_id, '📅 Due Today', `"${task.title}" is due today`, 'due_today', task.id);
          const io = getSocket();
          if (io) io.to(task.user_id).emit('notification', { id: notifId, title: '📅 Due Today', body: `"${task.title}" is due today`, type: 'due_today', task_id: task.id });
        }
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });

  console.log('⏰ Reminder scheduler started (runs every minute)');
}

module.exports = { startReminderJob };