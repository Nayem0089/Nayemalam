/**
 * GROUP MANAGEMENT ROUTES (/api/groups)
 */

const express = require('express');
const prisma = require('../prisma');
const { authenticateAdmin } = require('../middleware/auth');
const tournamentService = require('../services/tournament.service');

const router = express.Router();

// GET /api/groups
router.get('/', async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { order: 'asc' },
      include: {
        teams: { orderBy: { order: 'asc' } }
      }
    });
    res.json({ success: true, groups });
  } catch (err) {
    next(err);
  }
});

// POST /api/groups (ADMIN: Create new group)
router.post('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { name, copyRosterFromGroupId } = req.body;
    const cleanName = (name || '').trim().toUpperCase();

    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Group name is required.' });
    }

    const existing = await prisma.group.findUnique({ where: { name: cleanName } });
    if (existing) {
      return res.status(400).json({ success: false, error: `Group "${cleanName}" already exists.` });
    }

    const maxOrder = await prisma.group.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const group = await prisma.group.create({
      data: {
        name: cleanName,
        order: nextOrder
      }
    });

    // Populate squads: either copied from an existing group (scores reset) or 12 clean slots
    if (copyRosterFromGroupId) {
      const sourceTeams = await prisma.team.findMany({
        where: { groupId: copyRosterFromGroupId },
        orderBy: { order: 'asc' }
      });

      for (const st of sourceTeams) {
        await prisma.team.create({
          data: {
            groupId: group.id,
            name: st.name,
            logo: st.logo || '',
            order: st.order
          }
        });
      }
    } else {
      for (let s = 1; s <= 12; s++) {
        await prisma.team.create({
          data: {
            groupId: group.id,
            name: `Squad ${String(s).padStart(2, '0')}`,
            order: s
          }
        });
      }
    }

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, group, data: fullData, message: `Created ${cleanName}` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/groups/:id (ADMIN: Rename group)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const cleanName = (name || '').trim().toUpperCase();

    if (!cleanName) {
      return res.status(400).json({ success: false, error: 'Group name is required.' });
    }

    const updated = await prisma.group.update({
      where: { id },
      data: { name: cleanName }
    });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, group: updated, data: fullData, message: `Renamed group to ${cleanName}` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/groups/:id (ADMIN: Delete group)
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const count = await prisma.group.count();
    if (count <= 1) {
      return res.status(400).json({ success: false, error: 'Cannot delete the only remaining group.' });
    }

    await prisma.group.delete({ where: { id } });

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: 'Group deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/groups/:id/duplicate (ADMIN: Duplicate group)
router.post('/:id/duplicate', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const sourceGroup = await prisma.group.findUnique({
      where: { id },
      include: { teams: { orderBy: { order: 'asc' } } }
    });

    if (!sourceGroup) {
      return res.status(404).json({ success: false, error: 'Source group not found.' });
    }

    let newName = `${sourceGroup.name} (COPY)`;
    let counter = 2;
    while (await prisma.group.findUnique({ where: { name: newName } })) {
      newName = `${sourceGroup.name} (COPY ${counter})`;
      counter++;
    }

    const maxOrder = await prisma.group.aggregate({ _max: { order: true } });
    const newGroup = await prisma.group.create({
      data: {
        name: newName,
        order: (maxOrder._max.order || 0) + 1
      }
    });

    for (const t of sourceGroup.teams) {
      await prisma.team.create({
        data: {
          groupId: newGroup.id,
          name: t.name,
          logo: t.logo || '',
          order: t.order
        }
      });
    }

    const fullData = await tournamentService.getFullTournamentData();
    res.json({ success: true, data: fullData, message: `Duplicated to ${newName}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
