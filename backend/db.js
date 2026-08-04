const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'mice_esg.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Initialize Tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyringParticipants INTEGER DEFAULT 0,
      keyringReducedCarbonGrams REAL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS item_stats (
      item_key TEXT PRIMARY KEY,
      count REAL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS participations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT,
      username TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default data if empty
  db.get("SELECT COUNT(*) as count FROM stats", (err, row) => {
    if (row && row.count === 0) {
      db.run("INSERT INTO stats (keyringParticipants, keyringReducedCarbonGrams) VALUES (128, 1536)");
    }
  });

  const defaultItems = [
    ['reusable_cup', 0],
    ['reusable_plate', 0],
    ['reusable_bowl', 0],
    ['reusable_fork', 0],
    ['public_transport_km', 0],
    ['renewable_energy', 0],
    ['upcycled_keyring', 128],
    ['upcycled_banner', 0],
    ['paperless_booth', 0],
    ['digital_signage', 0],
    ['waste_recycling', 0],
    ['barrier_free', 0]
  ];

  defaultItems.forEach(([key, count]) => {
    db.run("INSERT OR IGNORE INTO item_stats (item_key, count) VALUES (?, ?)", [key, count]);
  });
});

module.exports = db;
