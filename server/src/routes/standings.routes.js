/**
 * STANDINGS LIVE PERSISTENCE & REAL-TIME BROADCAST ROUTE
 * (/api/standings)
 *
 * Ensures all tournament standings, point edits, team additions,
 * branding changes and custom PNG logos persist centrally on the server
 * and sync live across all visitors on any PC, laptop, or mobile device.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const STANDINGS_FILE = path.join(DATA_DIR, 'standings.json');

// In-memory state and real-time SSE subscriber pool
let currentStandings = null;
let currentVersion = Date.now();
const sseClients = new Set();

// Initialize data from persistent disk storage or database
function loadInitialData() {
  try {
    if (fs.existsSync(STANDINGS_FILE)) {
      const raw = fs.readFileSync(STANDINGS_FILE, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.squads && parsed.tournament) {
          currentStandings = parsed;
          currentVersion = parsed._version || Date.now();
          console.log(`✅ Loaded central standings (${currentStandings.squads.length} squads) from: ${STANDINGS_FILE}`);
          return;
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not load standings.json on boot, initializing defaults:', err.message);
  }

  // Fallback defaults with clean 0 points
  currentStandings = {
    _version: currentVersion,
    adminPassword: 'admin123',
    tournament: {
      orgName: 'WARZONE',
      tournTitle: 'DAILY PAID SCRIM',
      tournSubtitle: 'OVERALL STANDINGS',
      matchInfo: 'WEEK 01 DAY 01',
      footerText: 'Powered by WARZONE',
      logoVal: 'WZ'
    },
    scoring: {
      "1": 12, "2": 9, "3": 8, "4": 7, "5": 6, "6": 5, "7": 4, "8": 3,
      "9": 2, "10": 1, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0
    },
    squads: [
      { id: 'sq_1',  name: 'OutLaw',           logo: 'OL',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['OutLaw_King', 'OutLaw_Viper', 'OutLaw_Zeus', 'OutLaw_Ghost'] },
      { id: 'sq_2',  name: 'ZERO GRAVITY xNS', logo: 'ZG',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['ZG_Ragnar', 'ZG_Kage', 'ZG_Nova', 'ZG_Venom'] },
      { id: 'sq_3',  name: 'FLAWLESS',         logo: 'FLW', matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['FLW_Ace', 'FLW_Demon', 'FLW_Sniper', 'FLW_Reaper'] },
      { id: 'sq_4',  name: 'VEXARCH',          logo: 'VEX', matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['VEX_Alpha', 'VEX_Ronin', 'VEX_Blaze', 'VEX_Storm'] },
      { id: 'sq_5',  name: 'WARBORN OFFICIAL', logo: 'WB',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['WB_Warlord', 'WB_Striker', 'WB_Titan', 'WB_Echo'] },
      { id: 'sq_6',  name: 'MYSTIC WOLVES',    logo: 'MW',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['MW_Wolfy', 'MW_Claw', 'MW_Fang', 'MW_Howler'] },
      { id: 'sq_7',  name: 'ESS 11',           logo: 'ESS', matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['ESS_Eleven', 'ESS_Matrix', 'ESS_Chaos', 'ESS_Frost'] },
      { id: 'sq_8',  name: 'DIVINE CORPSE',    logo: 'DC',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['DC_Immortal', 'DC_Revenant', 'DC_Phantom', 'DC_Specter'] },
      { id: 'sq_9',  name: 'UNO REVERSE',      logo: 'UNO', matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['UNO_Card', 'UNO_Wild', 'UNO_Skip', 'UNO_Draw4'] },
      { id: 'sq_10', name: 'CHOSEN ONES',      logo: 'CO',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['CO_Neo', 'CO_Morpheus', 'CO_Trinity', 'CO_Oracle'] },
      { id: 'sq_11', name: 'NO SKILL',         logo: 'NS',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['NS_Lucky', 'NS_NoobMaster', 'NS_Clutch', 'NS_RNG'] },
      { id: 'sq_12', name: 'ZERO LIMIT',       logo: 'ZL',  matches: 0, wins: 0, posPts: 0, killPts: 0, total: 0, roster: ['ZL_Infinity', 'ZL_Apex', 'ZL_Surge', 'ZL_Pulse'] }
    ],
    matchHistory: [],
    ui: {
      editMode: false,
      showRosters: false,
      searchQuery: ''
    }
  };

  saveToFile(currentStandings);
}

// Safely persist to file
function saveToFile(data) {
  try {
    data._version = currentVersion;
    fs.writeFileSync(STANDINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ Failed writing standings file:', err.message);
  }
}

// Broadcast to all active browser connections
function broadcastToClients(data, version) {
  const message = `data: ${JSON.stringify({ type: 'update', version, data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Optional asynchronous mirror to PostgreSQL
async function mirrorToDatabase(data) {
  try {
    const prisma = require('../prisma');
    if (prisma && prisma.tournamentSetting) {
      await prisma.tournamentSetting.upsert({
        where: { id: 'default' },
        update: {
          websiteName: data.tournament?.orgName || 'WARZONE',
          tournamentName: data.tournament?.tournTitle || 'DAILY PAID SCRIM',
          tournamentSubtitle: data.tournament?.tournSubtitle || 'OVERALL STANDINGS',
          matchInfoLine: data.tournament?.matchInfo || 'WEEK 01 DAY 01',
          footerText: data.tournament?.footerText || 'Powered by WARZONE',
          tournamentLogo: data.tournament?.logoVal || 'WZ',
          customTheme: data
        },
        create: {
          id: 'default',
          websiteName: data.tournament?.orgName || 'WARZONE',
          tournamentName: data.tournament?.tournTitle || 'DAILY PAID SCRIM',
          tournamentSubtitle: data.tournament?.tournSubtitle || 'OVERALL STANDINGS',
          matchInfoLine: data.tournament?.matchInfo || 'WEEK 01 DAY 01',
          footerText: data.tournament?.footerText || 'Powered by WARZONE',
          tournamentLogo: data.tournament?.logoVal || 'WZ',
          currentTheme: 'redEsports',
          killWeight: 1.0,
          placementPoints: data.scoring || {},
          tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints'],
          autoRanking: true,
          customTheme: data
        }
      });
    }
  } catch (err) {
    // Database mirror is auxiliary; standings.json is primary
  }
}

// Heartbeat ping every 25s to keep connections alive through Render reverse-proxies
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': ping\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 25000);

// Load data on startup
loadInitialData();

/**
 * 1. GET /api/standings
 * Public endpoint to fetch full tournament standings.
 * Supports conditional ?version=... to save bandwidth.
 */
router.get('/', (req, res) => {
  const reqVersion = req.query.version ? parseInt(req.query.version, 10) : 0;
  if (reqVersion && reqVersion === currentVersion) {
    return res.json({ success: true, unchanged: true, version: currentVersion });
  }

  res.json({
    success: true,
    version: currentVersion,
    data: currentStandings
  });
});

/**
 * 2. POST /api/standings
 * Admin endpoint to save full tournament state centrally.
 * Persists immediately and pushes live to all other PCs / browsers.
 */
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !data.squads || !data.tournament) {
      return res.status(400).json({ success: false, error: 'Invalid tournament data structure' });
    }

    currentVersion = Date.now();
    currentStandings = data;
    currentStandings._version = currentVersion;

    // 1. Save synchronously to permanent server disk
    saveToFile(currentStandings);

    // 2. Broadcast immediately to all connected browsers via Server-Sent Events
    broadcastToClients(currentStandings, currentVersion);

    // 3. Background mirror to PostgreSQL
    mirrorToDatabase(currentStandings).catch(() => {});

    console.log(`💾 Live Standings updated & broadcast to ${sseClients.size} connected viewers (v${currentVersion})`);

    res.json({
      success: true,
      version: currentVersion,
      message: 'Standings successfully saved to server and broadcast live to all visitors.'
    });
  } catch (err) {
    console.error('Error saving standings:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/standings/live
 * Real-time Server-Sent Events (SSE) feed.
 * Allows every visitor on any PC or phone to see point updates instantly.
 */
router.get('/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering on Nginx/Render proxies
  res.flushHeaders?.();

  // Send current state on connection
  res.write(`data: ${JSON.stringify({ type: 'init', version: currentVersion, data: currentStandings })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

module.exports = router;
