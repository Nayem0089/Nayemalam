/**
 * TOURNAMENT & SETTINGS ROUTES (/api/tournament)
 */

const express = require('express');
const prisma = require('../prisma');
const tournamentService = require('../services/tournament.service');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/tournament (PUBLIC: Returns full standings, groups, settings)
router.get('/', async (req, res, next) => {
  try {
    const data = await tournamentService.getFullTournamentData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tournament/settings (ADMIN: Update branding, scoring matrix, theme)
router.put('/settings', authenticateAdmin, async (req, res, next) => {
  try {
    const updates = req.body;

    const updated = await prisma.tournamentSetting.upsert({
      where: { id: 'default' },
      update: {
        websiteName: updates.websiteName,
        websiteLogo: updates.websiteLogo,
        tournamentName: updates.tournamentName,
        tournamentSubtitle: updates.tournamentSubtitle,
        matchInfoLine: updates.matchInfoLine,
        footerText: updates.footerText,
        tournamentLogo: updates.tournamentLogo,
        currentTheme: updates.currentTheme,
        customTheme: updates.customTheme,
        killWeight: updates.killWeight !== undefined ? parseFloat(updates.killWeight) : undefined,
        placementPoints: updates.placementPoints,
        tiebreakerPriority: updates.tiebreakerPriority,
        autoRanking: updates.autoRanking !== undefined ? Boolean(updates.autoRanking) : undefined
      },
      create: {
        id: 'default',
        websiteName: updates.websiteName || 'WARZONE OFFICIAL',
        tournamentName: updates.tournamentName || 'DAILY PAID SCRIM',
        tournamentSubtitle: updates.tournamentSubtitle || 'OVERALL STANDINGS',
        matchInfoLine: updates.matchInfoLine || 'WEEK 01 DAY 01',
        footerText: updates.footerText || 'Powered by WARZONE OFFICIAL',
        currentTheme: updates.currentTheme || 'redEsports',
        killWeight: 1.0,
        placementPoints: updates.placementPoints || {},
        tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints'],
        autoRanking: true
      }
    });

    res.json({ success: true, settings: updated, message: 'Settings saved successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/tournament/backup (ADMIN: Export complete JSON backup)
router.get('/backup', authenticateAdmin, async (req, res, next) => {
  try {
    const data = await tournamentService.getFullTournamentData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=warzone_backup_${Date.now()}.json`);
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    next(err);
  }
});

// POST /api/tournament/restore (ADMIN: Import and restore complete JSON backup)
router.post('/restore', authenticateAdmin, async (req, res, next) => {
  try {
    const backup = req.body;

    if (!backup || !backup.groups || !backup.settings) {
      return res.status(400).json({ success: false, error: 'Invalid backup JSON file structure.' });
    }

    // 1. Restore Settings
    await prisma.tournamentSetting.upsert({
      where: { id: 'default' },
      update: {
        websiteName: backup.settings.websiteName,
        tournamentName: backup.settings.tournamentName,
        tournamentSubtitle: backup.settings.tournamentSubtitle,
        matchInfoLine: backup.settings.matchInfoLine,
        footerText: backup.settings.footerText,
        tournamentLogo: backup.settings.tournamentLogo,
        currentTheme: backup.settings.currentTheme,
        killWeight: backup.settings.killWeight || 1.0,
        placementPoints: backup.settings.placementPoints || {},
        tiebreakerPriority: backup.settings.tiebreakerPriority || []
      },
      create: {
        id: 'default',
        websiteName: backup.settings.websiteName || 'WARZONE OFFICIAL',
        tournamentName: backup.settings.tournamentName || 'DAILY PAID SCRIM',
        tournamentSubtitle: backup.settings.tournamentSubtitle || 'OVERALL STANDINGS',
        matchInfoLine: backup.settings.matchInfoLine || 'WEEK 01 DAY 01',
        footerText: backup.settings.footerText || 'Powered by WARZONE OFFICIAL',
        placementPoints: backup.settings.placementPoints || {},
        tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints']
      }
    });

    // 2. Clear existing groups, teams, and matches
    await prisma.matchResult.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.group.deleteMany({});

    // 3. Re-create groups, teams, and match records
    for (const grp of backup.groups) {
      const createdGroup = await prisma.group.create({
        data: {
          name: grp.name,
          order: grp.order || 0
        }
      });

      const teamMap = {};

      if (Array.isArray(grp.teams)) {
        for (const t of grp.teams) {
          const createdTeam = await prisma.team.create({
            data: {
              groupId: createdGroup.id,
              name: t.name,
              logo: t.logo || '',
              matches: t.matches || 0,
              wins: t.wins || 0,
              positionPoints: t.positionPoints || 0,
              killPoints: t.killPoints || 0,
              total: t.total || 0,
              order: t.order || 0
            }
          });
          teamMap[t.id || t.name] = createdTeam.id;
        }
      }

      if (Array.isArray(grp.matches)) {
        for (const m of grp.matches) {
          const matchedTeamId = teamMap[m.teamId] || teamMap[m.teamName];
          if (matchedTeamId) {
            await prisma.matchResult.create({
              data: {
                groupId: createdGroup.id,
                teamId: matchedTeamId,
                matchNumber: m.matchNumber || 1,
                position: m.position || 0,
                positionPoints: m.positionPoints || 0,
                kills: m.kills || 0,
                killPoints: m.killPoints || 0,
                totalPoints: m.totalPoints || 0,
                isWin: m.isWin || false,
                notes: m.notes || ''
              }
            });
          }
        }
      }
    }

    const refreshed = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: refreshed, message: 'Tournament backup restored successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/tournament/reset-group-points (ADMIN)
router.post('/reset-group-points', authenticateAdmin, async (req, res, next) => {
  try {
    const { groupId } = req.body;
    if (!groupId) {
      return res.status(400).json({ success: false, error: 'groupId is required.' });
    }

    await prisma.team.updateMany({
      where: { groupId },
      data: {
        matches: 0,
        wins: 0,
        positionPoints: 0,
        killPoints: 0,
        total: 0
      }
    });

    await prisma.matchResult.deleteMany({
      where: { groupId }
    });

    const refreshed = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: refreshed, message: 'Group points and match records reset.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
