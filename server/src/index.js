/**
 * WARZONE OFFICIAL — ESPORTS TOURNAMENT STANDINGS MANAGER
 * Production Fullstack Server for Render.com Hosting
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const prisma = require('./prisma');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import Route Handlers
const authRoutes = require('./routes/auth.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const groupRoutes = require('./routes/group.routes');
const teamRoutes = require('./routes/team.routes');
const matchRoutes = require('./routes/match.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // Essential for Render container binding

// 1. Security & Core Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows custom esports fonts and image previews
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// 2. Health Check Endpoint (Required for Render Zero-Downtime Deploys)
app.get('/health', async (req, res) => {
  try {
    // Quick probe to ensure PostgreSQL is responsive
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      service: 'Warzone Esports Tournament Manager',
      uptime: Math.floor(process.uptime()),
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

app.get('/api/health', (req, res) => res.redirect('/health'));

// 3. API Routes (Rate limited)
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/upload', uploadRoutes);

// 4. Static File Hosting for Client (React/Vite Production Build)
const CLIENT_DIST = path.join(__dirname, '../../client/dist');
const LEGACY_ROOT = path.join(__dirname, '../../');

// Serve client assets
if (fs.existsSync(CLIENT_DIST)) {
  console.log(`📦 Serving React + Vite build from: ${CLIENT_DIST}`);
  app.use(express.static(CLIENT_DIST));
} else {
  console.log(`📁 Client dist not built yet. Serving root assets.`);
  app.use(express.static(LEGACY_ROOT));
}

// Ensure public assets (like logo) are accessible
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/assets', express.static(path.join(__dirname, '../../client/public/assets')));

// 5. Catch-All Route for Single Page Application (SPA) Client Routing
app.get('*', (req, res) => {
  const indexHtml = path.join(CLIENT_DIST, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.sendFile(path.join(LEGACY_ROOT, 'index.html'));
  }
});

// 6. Centralized Error Handler
app.use(errorHandler);

// 7. Start HTTP Server bound to 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log('================================================================');
  console.log('🔥 WARZONE OFFICIAL — ESPORTS TOURNAMENT STANDINGS MANAGER');
  console.log(`🌐 Server active on: http://${HOST}:${PORT}`);
  console.log(`🚀 Health Check:     http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment:      ${process.env.NODE_ENV || 'development'}`);
  console.log('================================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Closing database connections...');
  await prisma.$disconnect();
  process.exit(0);
});
