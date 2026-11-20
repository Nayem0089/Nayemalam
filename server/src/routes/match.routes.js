/**
 * MATCH RESULT & AUDIT LOG ROUTES (/api/matches)
 */

const express = require('express');
const prisma = require('../prisma');
const { authenticateAdmin } = require('../middleware/auth');
const tournamentService = require('../services/tournament.service');

const router = express.Router();

// POST /api/matches (ADMIN: Quick Point Update - record new match result)
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { groupId, teamId, matchNumber, position, positionPoints, kills, isWin, notes } = req.body;

    if (!groupId || !teamId) {
      return res.status(400).json({ success: false, error: 'groupId and teamId are required.' });
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }

    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 'default' } });
    const killWeight = settings ? settings.killWeight : 1.0;

    const matchNo = Math.max(1, parseInt(matchNumber) || 1);
    const pos = parseInt(position) || 0;
    const posPts = Math.max(0, parseFloat(positionPoints) || 0);
    const killCount = Math.max(0, parseInt(kills) || 0);
    const killPts = Math.round(killCount * killWeight * 100) / 100;
    const isWinner = Boolean(isWin) || pos === 1;
    const matchTotal = Math.round((posPts + killPts) * 100) / 100;

    // Use transaction to atomically record match and increment squad stats
    const [createdMatch, updatedTeam] = await prisma.$transaction([
      prisma.matchResult.create({
        data: {
          groupId,
          teamId,
          matchNumber: matchNo,
          position: pos,
          positionPoints: posPts,
          kills: killCount,
          killPoints: killPts,
          totalPoints: matchTotal,
          isWin: isWinner,
          notes: notes || ''
        }
      }),
      prisma.team.update({
        where: { id: teamId },
        data: {
          matches: { increment: 1 },
          wins: isWinner ? { increment: 1 } : undefined,
          positionPoints: { increment: posPts },
          killPoints: { increment: killPts },
          total: { increment: matchTotal }
        }
      })
    ]);

    const fullData = await tournamentService.getFullTournamentData();
    res.json({
      success: true,
      match: createdMatch,
      team: updatedTeam,
      data: fullData,
      message: `Match ${matchNo} saved for ${team.name} (+${matchTotal} Pts)`
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/matches/:id (ADMIN: Edit historical match result & auto-adjust team stats)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { matchNumber, position, positionPoints, kills, isWin, notes } = req.body;

    const existingMatch = await prisma.matchResult.findUnique({ where: { id } });
    if (!existingMatch) {
      return res.status(404).json({ success: false, error: 'Match record not found.' });
    }

    const team = await prisma.team.findUnique({ where: { id: existingMatch.teamId } });
    if (!team) {
      return res.status(404).json({ success: false, error: 'Associated team not found.' });
    }

    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 'default' } });
    const killWeight = settings ? settings.killWeight : 1.0;

    const newMatchNo = matchNumber !== undefined ? Math.max(1, parseInt(matchNumber) || 1) : existingMatch.matchNumber;
    const newPos = position !== undefined ? parseInt(position) || 0 : existingMatch.position;
    const newPosPts = positionPoints !== undefined ? Math.max(0, parseFloat(positionPoints) || 0) : existingMatch.positionPoints;
    const newKills = kills !== undefined ? Math.max(0, parseInt(kills) || 0) : existingMatch.kills;
    const newKillPts = Math.round(newKills * killWeight * 100) / 100;
    const newIsWin = isWin !== undefined ? Boolean(isWin) : existingMatch.isWin;
    const newTotal = Math.round((newPosPts + newKillPts) * 100) / 100;

    // Delta calculations
    const oldWin = existingMatch.isWin ? 1 : 0;
    const curWin = newIsWin ? 1 : 0;
    const deltaWins = curWin - oldWin;
    const deltaPosPts = newPosPts - existingMatch.positionPoints;
    const deltaKillPts = newKillPts - existingMatch.killPoints;
    const deltaTotal = newTotal - existingMatch.totalPoints;

    await prisma.$transaction([
      prisma.matchResult.update({
        where: { id },
        data: {
          matchNumber: newMatchNo,
          position: newPos,
          positionPoints: newPosPts,
          kills: newKills,
          killPoints: newKillPts,
          totalPoints: newTotal,
          isWin: newIsWin,
          notes: notes !== undefined ? notes : existingMatch.notes
        }
      }),
      prisma.team.update({
        where: { id: team.id },
        data: {
          wins: Math.max(0, team.wins + deltaWins),
          positionPoints: Math.max(0, Math.round((team.positionPoints + deltaPosPts) * 100) / 100),
          killPoints: Math.max(0, Math.round((team.killPoints + deltaKillPts) * 100) / 100),
          total: Math.max(0, Math.round((team.total + deltaTotal) * 100) / 100)
        }
      })
    ]);

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: `Updated Match ${newMatchNo} for ${team.name}` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/matches/:id (ADMIN: Rollback match result & restore squad points)
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.matchResult.findUnique({ where: { id } });
    if (!record) {
      return res.status(404).json({ success: false, error: 'Match record not found.' });
    }

    const team = await prisma.team.findUnique({ where: { id: record.teamId } });

    await prisma.$transaction([
      prisma.matchResult.delete({ where: { id } }),
      ...(team ? [
        prisma.team.update({
          where: { id: team.id },
          data: {
            matches: Math.max(0, team.matches - 1),
            wins: record.isWin ? Math.max(0, team.wins - 1) : undefined,
            positionPoints: Math.max(0, Math.round((team.positionPoints - record.positionPoints) * 100) / 100),
            killPoints: Math.max(0, Math.round((team.killPoints - record.killPoints) * 100) / 100),
            total: Math.max(0, Math.round((team.total - record.totalPoints) * 100) / 100)
          }
        })
      ] : [])
    ]);

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: `Match record deleted and points rolled back.` });
  } catch (err) {
    next(err);
  }
});

// POST /api/matches/clear-group/:groupId (ADMIN: Clear match history without touching leaderboard points)
router.post('/clear-group/:groupId', authenticateAdmin, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await prisma.matchResult.deleteMany({
      where: { groupId }
    });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: 'Match history cleared.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
