/**
 * DATABASE SEEDER FOR WARZONE OFFICIAL TOURNAMENT MANAGER
 * Populates PostgreSQL database with default admin, branding, groups, and reference teams
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_PLACEMENT_POINTS = {
  1: 12, // 1st Place (Booyah / WWCD)
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0
};

const REFERENCE_TEAMS_A = [
  { name: 'OutLaw',            matches: 6, wins: 2, positionPoints: 50, killPoints: 120, total: 170, order: 1 },
  { name: 'ZERO GRAVITY xNS',  matches: 5, wins: 2, positionPoints: 37, killPoints: 73,  total: 110, order: 2 },
  { name: 'FLAWLESS',          matches: 6, wins: 1, positionPoints: 46, killPoints: 57,  total: 103, order: 3 },
  { name: 'VEXARCH',           matches: 6, wins: 0, positionPoints: 37, killPoints: 31,  total: 68,  order: 4 },
  { name: 'WARBORN OFFICIAL',  matches: 6, wins: 1, positionPoints: 33, killPoints: 31,  total: 64,  order: 5 },
  { name: 'MYSTIC WOLVES',     matches: 6, wins: 1, positionPoints: 26, killPoints: 37,  total: 63,  order: 6 },
  { name: 'ESS 11',            matches: 6, wins: 0, positionPoints: 25, killPoints: 32,  total: 57,  order: 7 },
  { name: 'DIVINE CORPSE',     matches: 6, wins: 0, positionPoints: 25, killPoints: 31,  total: 56,  order: 8 },
  { name: 'UNO REVERSE',       matches: 5, wins: 0, positionPoints: 16, killPoints: 29,  total: 45,  order: 9 },
  { name: 'CHOSEN ONES',       matches: 6, wins: 0, positionPoints: 17, killPoints: 20,  total: 37,  order: 10 },
  { name: 'NO SKILL',          matches: 6, wins: 0, positionPoints: 23, killPoints: 13,  total: 36,  order: 11 },
  { name: 'ZERO LIMIT',        matches: 3, wins: 0, positionPoints: 8,  killPoints: 3,   total: 11,  order: 12 }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Admin
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: passwordHash
    }
  });
  console.log('✅ Admin account seeded: username "admin"');

  // 2. Seed Tournament Settings
  await prisma.tournamentSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
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
      placementPoints: DEFAULT_PLACEMENT_POINTS,
      tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints'],
      autoRanking: true
    }
  });
  console.log('✅ Tournament branding and scoring settings seeded');

  // 3. Seed Groups: GROUP A, GROUP B, GROUP C, GROUP D
  const groupNames = ['GROUP A', 'GROUP B', 'GROUP C', 'GROUP D'];
  for (let i = 0; i < groupNames.length; i++) {
    const name = groupNames[i];
    const group = await prisma.group.upsert({
      where: { name },
      update: { order: i + 1 },
      create: {
        name,
        order: i + 1
      }
    });

    // Check if group already has teams
    const existingTeamsCount = await prisma.team.count({ where: { groupId: group.id } });
    if (existingTeamsCount === 0) {
      if (name === 'GROUP A') {
        // Seed reference teams into GROUP A
        for (const t of REFERENCE_TEAMS_A) {
          await prisma.team.create({
            data: {
              groupId: group.id,
              name: t.name,
              logo: '',
              matches: t.matches,
              wins: t.wins,
              positionPoints: t.positionPoints,
              killPoints: t.killPoints,
              total: t.total,
              order: t.order
            }
          });
        }
        console.log(`✅ Seeded 12 official reference teams into ${name}`);

        // Seed sample match results
        const firstTeam = await prisma.team.findFirst({ where: { groupId: group.id, name: 'OutLaw' } });
        const secondTeam = await prisma.team.findFirst({ where: { groupId: group.id, name: 'ZERO GRAVITY xNS' } });

        if (firstTeam) {
          await prisma.matchResult.create({
            data: {
              groupId: group.id,
              teamId: firstTeam.id,
              matchNumber: 1,
              position: 1,
              positionPoints: 12,
              kills: 22,
              killPoints: 22,
              totalPoints: 34,
              isWin: true,
              notes: 'Match 1 Booyah'
            }
          });
        }

        if (secondTeam) {
          await prisma.matchResult.create({
            data: {
              groupId: group.id,
              teamId: secondTeam.id,
              matchNumber: 2,
              position: 1,
              positionPoints: 12,
              kills: 18,
              killPoints: 18,
              totalPoints: 30,
              isWin: true,
              notes: 'Match 2 Booyah'
            }
          });
        }
      } else {
        // Seed default 12 clean squad slots into other groups
        for (let s = 1; s <= 12; s++) {
          await prisma.team.create({
            data: {
              groupId: group.id,
              name: `Squad ${String(s).padStart(2, '0')}`,
              logo: '',
              matches: 0,
              wins: 0,
              positionPoints: 0,
              killPoints: 0,
              total: 0,
              order: s
            }
          });
        }
        console.log(`✅ Seeded 12 squads into ${name}`);
      }
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
