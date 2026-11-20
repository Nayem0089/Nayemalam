/**
 * TOURNAMENT CALCULATION & RANKING SERVICE
 */

const prisma = require('../prisma');

class TournamentService {
  /**
   * Get full tournament payload including settings, groups, teams, and match history
   */
  async getFullTournamentData() {
    let settings = await prisma.tournamentSetting.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.tournamentSetting.create({
        data: {
          id: 'default',
          websiteName: 'WARZONE OFFICIAL',
          websiteLogo: '/assets/warzone-logo.png',
          tournamentName: 'DAILY PAID SCRIM',
          tournamentSubtitle: 'OVERALL STANDINGS',
          matchInfoLine: 'WEEK 01 DAY 01',
          footerText: 'Powered by WARZONE OFFICIAL',
          tournamentLogo: '/assets/warzone-logo.png',
          currentTheme: 'redEsports',
          killWeight: 1.0,
          placementPoints: {
            1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0
          },
          tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints'],
          autoRanking: true
        }
      });
    }

    const groups = await prisma.group.findMany({
      orderBy: { order: 'asc' },
      include: {
        teams: {
          orderBy: { order: 'asc' }
        },
        matches: {
          orderBy: { createdAt: 'desc' },
          include: {
            team: {
              select: { name: true, logo: true }
            }
          }
        }
      }
    });

    // Auto-rank squads if autoRanking is true
    const killWeight = settings.killWeight || 1.0;
    const isAutoRank = settings.autoRanking;

    const formattedGroups = groups.map(grp => {
      let teams = [...grp.teams];

      if (isAutoRank) {
        teams.sort((a, b) => {
          const totA = Number(a.positionPoints || 0) + Number(a.killPoints || 0) * killWeight;
          const totB = Number(b.positionPoints || 0) + Number(b.killPoints || 0) * killWeight;
          if (totB !== totA) return totB - totA;
          if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
          if ((b.killPoints || 0) !== (a.killPoints || 0)) return (b.killPoints || 0) - (a.killPoints || 0);
          return (b.positionPoints || 0) - (a.positionPoints || 0);
        });
      } else {
        teams.sort((a, b) => (a.order || 0) - (b.order || 0));
      }

      return {
        id: grp.id,
        name: grp.name,
        order: grp.order,
        teams: teams.map((t, idx) => ({
          ...t,
          rank: idx + 1,
          total: Math.round(((Number(t.positionPoints) || 0) + (Number(t.killPoints) || 0) * killWeight) * 100) / 100
        })),
        matches: grp.matches.map(m => ({
          id: m.id,
          groupId: m.groupId,
          teamId: m.teamId,
          teamName: m.team ? m.team.name : 'Unknown',
          matchNumber: m.matchNumber,
          position: m.position,
          positionPoints: m.positionPoints,
          kills: m.kills,
          killPoints: m.killPoints,
          totalPoints: m.totalPoints,
          isWin: m.isWin,
          notes: m.notes,
          createdAt: m.createdAt
        }))
      };
    });

    return {
      settings,
      groups: formattedGroups
    };
  }

  /**
   * Recalculate a team's total points based on positionPoints and killPoints
   */
  calculateTeamTotal(posPoints, killPoints, killWeight = 1.0) {
    return Math.round(((Number(posPoints) || 0) + (Number(killPoints) || 0) * killWeight) * 100) / 100;
  }
}

module.exports = new TournamentService();
