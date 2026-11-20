/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Express + SQLite Backend Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Serve frontend static assets from parent directory
const STATIC_ROOT = path.join(__dirname, '..');
app.use(express.static(STATIC_ROOT));

// REST API Endpoints
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', server: 'Esports Tournament Backend', time: Date.now() });
});

// Get current tournament state from SQLite
app.get('/api/tournament', async (req, res) => {
  try {
    const data = await db.getState();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save tournament state to SQLite
app.post('/api/tournament', async (req, res) => {
  try {
    const stateString = JSON.stringify(req.body);
    await db.saveState(stateString);
    res.json({ success: true, message: 'Saved to SQLite database' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record individual match
app.post('/api/match-result', async (req, res) => {
  try {
    await db.recordMatch(req.body);
    res.json({ success: true, message: 'Match recorded' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_ROOT, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🔥 ESPORTS TOURNAMENT STANDINGS MANAGER SERVER RUNNING`);
  console.log(`🌐 Localhost URL: http://localhost:${PORT}`);
  console.log(`📁 Static files: ${STATIC_ROOT}`);
  console.log(`====================================================`);
});
