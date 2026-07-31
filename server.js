const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from the current directory with cache disabled
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Route to serve the main HTML file with cache disabled
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(__dirname, 'mice.html'));
});

// Cache carbon coefficients in memory
let actionCoefficients = {
  reusable_cup: 52,
  reusable_plate: 37,
  reusable_bowl: 60,
  reusable_fork: 9,
  public_transport: 120,
  upcycled_keyring: 16,
  upcycled_banner: 6280,
  paper_booth: 10125
};

// Update cache from DB in case they are modified
function updateCoefficientsCache() {
  db.all("SELECT id, carbon_reduction FROM actions", [], (err, rows) => {
    if (!err && rows) {
      rows.forEach(row => {
        actionCoefficients[row.id] = row.carbon_reduction;
      });
      console.log('Carbon coefficients cache updated:', actionCoefficients);
    }
  });
}
// Init cache after DB seeding
setTimeout(updateCoefficientsCache, 1500);

// SSE clients list
let sseClients = [];

// Helper to query statistics
function getStats(callback) {
  const query = `
    SELECT 
      COALESCE(SUM(reduced_carbon), 0) as total_reduced,
      COALESCE(SUM(CASE WHEN action_id = 'reusable_cup' THEN quantity ELSE 0 END), 0) as total_cup,
      COALESCE(SUM(CASE WHEN action_id = 'reusable_plate' THEN quantity ELSE 0 END), 0) as total_plate,
      COALESCE(SUM(CASE WHEN action_id = 'reusable_bowl' THEN quantity ELSE 0 END), 0) as total_bowl,
      COALESCE(SUM(CASE WHEN action_id = 'reusable_fork' THEN quantity ELSE 0 END), 0) as total_fork,
      COALESCE(SUM(CASE WHEN action_id = 'public_transport' THEN quantity ELSE 0 END), 0) as total_transport,
      COALESCE(SUM(CASE WHEN action_id = 'renewable_energy' THEN quantity ELSE 0 END), 0) as total_energy,
      COALESCE(SUM(CASE WHEN action_id = 'upcycled_keyring' THEN quantity ELSE 0 END), 0) as total_keyring,
      COALESCE(SUM(CASE WHEN action_id = 'upcycled_banner' THEN quantity ELSE 0 END), 0) as total_banner,
      COALESCE(SUM(CASE WHEN action_id = 'paper_booth' THEN quantity ELSE 0 END), 0) as total_paper_booth,
      COALESCE(SUM(CASE WHEN action_id = 'digital_signage' THEN quantity ELSE 0 END), 0) as total_digital_signage,
      COALESCE(SUM(CASE WHEN action_id = 'upcycled_keyring' THEN reduced_carbon ELSE 0 END), 0) as total_keyring_carbon,
      COALESCE(COUNT(DISTINCT CASE WHEN action_id = 'upcycled_keyring' THEN username END), 0) as keyring_participants,
      COALESCE(COUNT(DISTINCT CASE WHEN action_id = 'paper_booth' THEN username END), 0) as paper_booth_participants,
      COALESCE(COUNT(DISTINCT CASE WHEN action_id = 'digital_signage' THEN username END), 0) as signage_participants,
      COUNT(DISTINCT username) as total_participants
    FROM participation_logs
  `;
  db.get(query, [], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, {
        totalReducedCarbonGrams: row.total_reduced,
        totalReducedCarbonKg: parseFloat((row.total_reduced / 1000).toFixed(2)),
        items: {
          reusable_cup: row.total_cup,
          reusable_plate: row.total_plate,
          reusable_bowl: row.total_bowl,
          reusable_fork: row.total_fork,
          public_transport: row.total_transport,
          renewable_energy: row.total_energy,
          upcycled_keyring: row.total_keyring,
          upcycled_banner: row.total_banner,
          paper_booth: row.total_paper_booth,
          digital_signage: row.total_digital_signage
        },
        keyringReducedCarbonGrams: row.total_keyring_carbon,
        keyringParticipants: row.keyring_participants,
        paperBoothParticipants: row.paper_booth_participants,
        signageParticipants: row.signage_participants,
        totalParticipants: row.total_participants
      });
    }
  });
}

// Helper to broadcast update to all SSE clients
function broadcastStatsUpdate() {
  getStats((err, stats) => {
    if (err) {
      console.error('Failed to query stats for broadcast:', err);
      return;
    }
    const dataStr = JSON.stringify(stats);
    sseClients.forEach(client => {
      try {
        client.res.write(`data: ${dataStr}\n\n`);
      } catch (writeErr) {
        console.error('SSE client write error, removing client:', writeErr.message);
        sseClients = sseClients.filter(c => c.id !== client.id);
      }
    });
  });
}

// 1. GET Actions list
app.get('/api/actions', (req, res) => {
  db.all("SELECT * FROM actions", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 2. GET Stats
app.get('/api/stats', (req, res) => {
  getStats((err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stats);
  });
});

// 3. POST Participate (Multiple actions at once)
app.post('/api/participate', (req, res) => {
  const { username, session_token, actions } = req.body;
  
  if (!username || typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: '참여자 이름이 필요합니다.' });
  }
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: '행동 내역이 필요합니다.' });
  }

  // Filter out actions with 0 quantity
  const validActions = actions.filter(act => act.quantity > 0);
  
  // Handle session-based overwrite logic
  const deleteOldPromise = new Promise((resolve, reject) => {
    if (session_token) {
      db.run("DELETE FROM participation_logs WHERE session_token = ?", [session_token], (err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });

  deleteOldPromise.then(() => {
    if (validActions.length === 0) {
      // If all items were set to 0, they are deleted now. Return success.
      res.json({
        success: true,
        message: '참여 실천 사항이 성공적으로 수정(취소)되었습니다.',
        reducedCarbonGrams: 0
      });
      broadcastStatsUpdate();
      return;
    }

    // Prepare insert statements
    const placeholders = validActions.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const sql = `INSERT INTO participation_logs (username, session_token, action_id, quantity, reduced_carbon) VALUES ${placeholders}`;
    
    const params = [];
    let totalReducedInThisSession = 0;
    
    validActions.forEach(act => {
      let reduced = 0;
      if (act.action_id === 'upcycled_keyring') {
        // Formula: Q * W (0.01kg) * (E_virgin (2.0) - E_pre (0.4)) - E_trans (0.05kg)
        // = Q * 0.016 - 0.05 kg CO2eq = Q * 16 - 50 g CO2eq
        reduced = act.quantity * 16 - 50;
      } else {
        const coeff = actionCoefficients[act.action_id] || 0;
        reduced = act.quantity * coeff;
      }
      totalReducedInThisSession += reduced;
      params.push(username.trim(), session_token || null, act.action_id, act.quantity, reduced);
    });

    db.run(sql, params, function(err) {
      if (err) {
        console.error('DB Insert Error:', err.message);
        return res.status(500).json({ error: '참여 이력 저장에 실패했습니다.' });
      }
      
      res.json({
        success: true,
        message: '성공적으로 탄소 감축에 참여하였습니다.',
        reducedCarbonGrams: totalReducedInThisSession
      });

      // Broadcast updated stats to all connected SSE clients
      broadcastStatsUpdate();
    });
  }).catch(err => {
    console.error('DB Delete Error:', err.message);
    res.status(500).json({ error: '기존 기록 수정에 실패했습니다.' });
  });
});

// 4. SSE (Server-Sent Events) endpoint for real-time stats updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send current stats immediately on connection
  getStats((err, stats) => {
    if (!err && stats) {
      res.write(`data: ${JSON.stringify(stats)}\n\n`);
    }
  });

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Static web folder served from: ${__dirname}`);
});
