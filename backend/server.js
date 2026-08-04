const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from ../ (or ../frontend)
app.use(express.static(path.join(__dirname, '../'), {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Route for main frontend entry
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(__dirname, '../index.html'));
});

// REST API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MICE ESG Decoupled Backend API', timestamp: new Date() });
});

// REST API Get Stats
app.get('/api/stats', (req, res) => {
  db.get("SELECT keyringParticipants, keyringReducedCarbonGrams FROM stats ORDER BY id DESC LIMIT 1", (err, statRow) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all("SELECT item_key, count FROM item_stats", (err, itemRows) => {
      if (err) return res.status(500).json({ error: err.message });

      const items = {};
      (itemRows || []).forEach(row => {
        items[row.item_key] = row.count;
      });

      res.json({
        keyringParticipants: statRow ? statRow.keyringParticipants : 0,
        keyringReducedCarbonGrams: statRow ? statRow.keyringReducedCarbonGrams : 0,
        items: items
      });
    });
  });
});

// REST API Submit Participation
app.post('/api/participate', (req, res) => {
  const { sessionToken, username, items } = req.body;

  db.run("INSERT INTO participations (session_token, username) VALUES (?, ?)", [sessionToken || 'anonymous', username || '익명 참여자'], function(err) {
    if (err) console.error("Error logging participation:", err.message);
  });

  if (items && typeof items === 'object') {
    const stmt = db.prepare("INSERT INTO item_stats (item_key, count) VALUES (?, ?) ON CONFLICT(item_key) DO UPDATE SET count = count + excluded.count");
    Object.entries(items).forEach(([key, val]) => {
      if (typeof val === 'number') {
        stmt.run(key, val);
      }
    });
    stmt.finalize();
  }

  db.get("SELECT keyringParticipants, keyringReducedCarbonGrams FROM stats ORDER BY id DESC LIMIT 1", (err, statRow) => {
    db.all("SELECT item_key, count FROM item_stats", (err, itemRows) => {
      const itemsResult = {};
      (itemRows || []).forEach(row => {
        itemsResult[row.item_key] = row.count;
      });

      res.json({
        success: true,
        stats: {
          keyringParticipants: statRow ? statRow.keyringParticipants : 0,
          keyringReducedCarbonGrams: statRow ? statRow.keyringReducedCarbonGrams : 0,
          items: itemsResult
        }
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 MICE ESG Decoupled Backend Server running on http://localhost:${PORT}`);
  console.log(`===================================================`);
});
