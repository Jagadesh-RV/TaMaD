const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let db;

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

function initDatabase() {
  const dbPath = process.env.DB_PATH || './data/tamad.db';
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();
  seedDatabase();
  console.log(`✅ Database ready: ${dbPath}`);
  return db;
}

function createTables() {
  db.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      theme TEXT DEFAULT 'dark',
      timezone TEXT DEFAULT 'Asia/Kolkata',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Tags
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      parent_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      scheduled_at TEXT,
      completed_at TEXT,
      estimated_minutes INTEGER DEFAULT 30,
      actual_minutes INTEGER DEFAULT 0,
      recurrence TEXT,
      recurrence_end TEXT,
      position INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      roadmap_id TEXT,
      milestone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    -- Task Tags (many-to-many)
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (task_id, tag_id),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    -- Reminders
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      remind_at DATETIME NOT NULL,
      message TEXT,
      sent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      task_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Roadmaps
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Focus Sessions (Pomodoro)
    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      duration_minutes INTEGER NOT NULL,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      completed INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );

    -- Daily Goals
    CREATE TABLE IF NOT EXISTS daily_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      target_tasks INTEGER DEFAULT 5,
      completed_tasks INTEGER DEFAULT 0,
      streak_count INTEGER DEFAULT 0,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
  `);
}

function seedDatabase() {
  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@tamad.app');
    if (!existing) {
      const userId = uuidv4();
      const hashedPassword = bcrypt.hashSync('demo1234', 12);
      
      db.prepare('INSERT INTO users (id, name, email, password, avatar, theme, timezone) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(userId, 'Demo User', 'demo@tamad.app', hashedPassword, 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', 'dark', 'Asia/Kolkata');
      
      // Create default tags
      const defaultTags = [
        { id: uuidv4(), name: 'Work', color: '#6366f1' },
        { id: uuidv4(), name: 'Personal', color: '#f43f5e' },
        { id: uuidv4(), name: 'Health', color: '#22c55e' },
        { id: uuidv4(), name: 'Learning', color: '#f59e0b' },
      ];
      const insertTag = db.prepare('INSERT INTO tags (id, user_id, name, color) VALUES (?, ?, ?, ?)');
      for (const t of defaultTags) insertTag.run(t.id, userId, t.name, t.color);
      
      // Create sample tasks
      const sampleTasks = [
        { title: 'Build Premium Dashboard', priority: 'high', status: 'todo' },
        { title: 'Create Modern UI', priority: 'medium', status: 'completed' },
        { title: 'Setup Database', priority: 'high', status: 'in-progress' },
      ];
      const insertTask = db.prepare('INSERT INTO tasks (id, user_id, title, priority, status) VALUES (?, ?, ?, ?, ?)');
      for (const t of sampleTasks) {
        insertTask.run(uuidv4(), userId, t.title, t.priority, t.status);
      }
      
      console.log('✅ Demo user seeded successfully');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
}

module.exports = { getDb, initDatabase };