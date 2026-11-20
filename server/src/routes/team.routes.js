/**
 * TEAM & SQUAD MANAGEMENT ROUTES (/api/teams)
 */

const express = require('express');
const prisma = require('../prisma');
const { authenticateAdmin } = require('../middleware/auth');
const tournamentService = require('../services/tournament.service');

const router = express.Router();

// POST /api/teams (ADMIN: Add team slot)
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { groupId, name, logo } = req.body;

    if (!groupId) {
      return res.status(400).json({ success: false, error: 'groupId is required.' });
    }

    const currentCount = await prisma.team.count({ where: { groupId } });
    const teamName = (name || '').trim() || `Squad ${String(currentCount + 1).padStart(2, '0')}`;

    const created = await prisma.team.create({
      data: {
        groupId,
        name: teamName,
        logo: logo || '',
        order: currentCount + 1
      }
    });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, team: created, data: fullData, message: `Added ${teamName}` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/teams/:id (ADMIN: Update team name, logo, or direct score edits)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logo, matches, wins, positionPoints, killPoints, order } = req.body;

    const settings = await prisma.tournamentSetting.findUnique({ where: { id: 'default' } });
    const killWeight = settings ? settings.killWeight : 1.0;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (logo !== undefined) dataToUpdate.logo = logo;
    if (matches !== undefined) dataToUpdate.matches = Math.max(0, parseInt(matches) || 0);
    if (wins !== undefined) dataToUpdate.wins = Math.max(0, parseInt(wins) || 0);
    if (positionPoints !== undefined) dataToUpdate.positionPoints = Math.max(0, parseFloat(positionPoints) || 0);
    if (killPoints !== undefined) dataToUpdate.killPoints = Math.max(0, parseFloat(killPoints) || 0);
    if (order !== undefined) dataToUpdate.order = parseInt(order) || 0;

    // Recalculate total if points changed
    if (positionPoints !== undefined || killPoints !== undefined) {
      const existing = await prisma.team.findUnique({ where: { id } });
      const pos = positionPoints !== undefined ? dataToUpdate.positionPoints : existing.positionPoints;
      const kill = killPoints !== undefined ? dataToUpdate.killPoints : existing.killPoints;
      dataToUpdate.total = tournamentService.calculateTeamTotal(pos, kill, killWeight);
    }

    const updated = await prisma.team.update({
      where: { id },
      data: dataToUpdate
    });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, team: updated, data: fullData, message: `Updated squad ${updated.name}` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/teams/:id (ADMIN: Delete team)
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const team = await prisma.team.findUnique({ where: { id } });

    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found.' });
    }

    await prisma.team.delete({ where: { id } });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: `Deleted ${team.name}` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/teams/reorder (ADMIN: Bulk reorder teams)
router.put('/batch/reorder', authenticateAdmin, async (req, res, next) => {
  try {
    const { orderedTeamIds } = req.body; // Array of team IDs in desired order

    if (!Array.isArray(orderedTeamIds)) {
      return res.status(400).json({ success: false, error: 'orderedTeamIds array is required.' });
    }

    // Execute in transaction
    await prisma.$transaction(
      orderedTeamIds.map((teamId, index) =>
        prisma.team.update({
          where: { id: teamId },
          data: { order: index + 1 }
        })
      )
    );

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: 'Roster order updated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
