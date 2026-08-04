const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mice_carbon.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  // 1. Actions Table
  db.run(`
    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      carbon_reduction REAL NOT NULL, -- in grams (gCO2eq)
      unit_name TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating actions table:', err.message);
    } else {
      // Seed default actions
      const defaultActions = [
        { id: 'reusable_cup', name: '다회용 컵', carbon_reduction: 52, unit_name: '개' },
        { id: 'reusable_plate', name: '다회용 접시', carbon_reduction: 37, unit_name: '개' },
        { id: 'reusable_bowl', name: '다회용 볼', carbon_reduction: 60, unit_name: '개' },
        { id: 'reusable_fork', name: '다회용 포크', carbon_reduction: 9, unit_name: '개' },
        { id: 'public_transport', name: '친환경 이동수단', carbon_reduction: 120, unit_name: '인·km' },
        { id: 'renewable_energy', name: '재생에너지 사용', carbon_reduction: 478.1, unit_name: 'kWh' },
        { id: 'upcycled_keyring', name: '업사이클링 키링', carbon_reduction: 12, unit_name: '개' },
        { id: 'upcycled_banner', name: '업사이클링 현수막', carbon_reduction: 6280, unit_name: '장' },
        { id: 'paper_booth', name: '종이 전시부스', carbon_reduction: 10125, unit_name: '㎡' },
        { id: 'digital_signage', name: '디지털 페이퍼리스 & 사이니지', carbon_reduction: 1, unit_name: 'gCO2eq' },
        { id: 'waste_recycling', name: '자원순환 & 폐기물 재활용', carbon_reduction: 1, unit_name: 'gCO2eq' }
      ];

      defaultActions.forEach(action => {
        db.get("SELECT count(*) as count FROM actions WHERE id = ?", [action.id], (err, row) => {
          if (err) {
            console.error('Error checking action:', err.message);
            return;
          }
          if (row.count === 0) {
            db.run(
              "INSERT INTO actions (id, name, carbon_reduction, unit_name) VALUES (?, ?, ?, ?)",
              [action.id, action.name, action.carbon_reduction, action.unit_name],
              (err) => {
                if (err) {
                  console.error(`Failed to insert default action ${action.id}:`, err.message);
                } else {
                  console.log(`Default action '${action.name}' initialized with ${action.carbon_reduction}g reduction.`);
                }
              }
            );
          }
        });
      });
    }
  });

  // 2. Participation Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS participation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      session_token TEXT,
      action_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reduced_carbon REAL NOT NULL, -- in grams (gCO2eq)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (action_id) REFERENCES actions (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating participation_logs table:', err.message);
    } else {
      // Safely add column to existing databases
      db.run("ALTER TABLE participation_logs ADD COLUMN session_token TEXT", (err) => {
        // Will fail silently if the column already exists, which is expected
      });
    }
  });
});

module.exports = db;
