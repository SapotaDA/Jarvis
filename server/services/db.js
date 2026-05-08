const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../jarvis_memory.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    importance INTEGER DEFAULT 1,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT,
    duration INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = {
  addMemory: (content, type = 'general', importance = 1) => {
    const stmt = db.prepare('INSERT INTO memories (content, type, importance) VALUES (?, ?, ?)');
    return stmt.run(content, type, importance);
  },
  getMemories: (limit = 10) => {
    return db.prepare('SELECT * FROM memories ORDER BY timestamp DESC LIMIT ?').all(limit);
  },
  updateProfile: (key, value) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO user_profile (key, value) VALUES (?, ?)');
    return stmt.run(key, value);
  },
  getProfile: (key) => {
    return db.prepare('SELECT value FROM user_profile WHERE key = ?').get(key);
  }
};
