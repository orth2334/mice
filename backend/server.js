const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Serve frontend files from /frontend directory
const frontendPath = path.join(__dirname, '../frontend');
const rootPath = path.join(__dirname, '../');

app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

app.use(express.static(rootPath, {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Route to main page (frontend/index.html or frontend/mice.html)
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// REST API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MICE ESG Independent Backend API Server',
    architecture: 'Decoupled (Frontend / Backend)',
    timestamp: new Date()
  });
});

// REST API Stats Endpoint
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

// REST API Participate Endpoint
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
  console.log(`===========================================================`);
  console.log(`🚀 Decoupled MICE ESG Backend Server online at http://localhost:${PORT}`);
  console.log(`📁 Serving Frontend from: ${frontendPath}`);
  console.log(`===========================================================`);
});
