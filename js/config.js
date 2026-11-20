/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Default Configuration & Constants
 * Default Brand: WARZONE OFFICIAL
 */

const DEFAULT_CONFIG = {
  // Website & Tournament Branding
  branding: {
    websiteName: 'WARZONE OFFICIAL',
    websiteLogo: 'assets/warzone-logo.png',
    tournamentName: 'DAILY PAID SCRIM',
    tournamentSubtitle: 'OVERALL STANDINGS',
    matchInfoLine: 'WEEK 01 DAY 01',
    footerText: 'Powered by WARZONE OFFICIAL',
    footerMetaText: '12 Squads · Auto-Ranked',
    tournamentLogo: 'assets/warzone-logo.png'
  },

  // Scoring Rules Configuration
  scoring: {
    killWeight: 1, // Points per kill
    // Standard Free Fire / Battle Royale tournament placement points
    placementPoints: {
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
    },
    // Tiebreaker priority order: totalPoints -> wins -> killPoints -> positionPoints
    tiebreakerPriority: ['totalPoints', 'wins', 'killPoints', 'positionPoints']
  },

  // Visual Theme Presets
  themes: {
    redEsports: {
      id: 'redEsports',
      name: 'Red Esports (Default)',
      colors: {
        primary: '#FF3434',
        primaryGlow: 'rgba(255, 52, 52, 0.55)',
        secondary: '#FFD34D',
        secondaryGlow: 'rgba(255, 211, 77, 0.45)',
        background: '#0a0a0c',
        cardBg: 'rgba(18, 18, 22, 0.85)',
        cardBorder: 'rgba(255, 255, 255, 0.09)',
        textMain: '#ffffff',
        textMuted: '#9a9aa5',
        buttonGradient: 'linear-gradient(135deg, #FF3434 0%, #b81c1c 100%)',
        goldGradient: 'linear-gradient(135deg, #FFE58A 0%, #FFD34D 100%)'
      },
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Teko', sans-serif",
      borderRadius: '12px',
      glowIntensity: 'normal'
    },
    goldPremium: {
      id: 'goldPremium',
      name: 'Gold Premium',
      colors: {
        primary: '#FFD34D',
        primaryGlow: 'rgba(255, 211, 77, 0.55)',
        secondary: '#FF8833',
        secondaryGlow: 'rgba(255, 136, 51, 0.4)',
        background: '#0d0d0f',
        cardBg: 'rgba(24, 23, 20, 0.85)',
        cardBorder: 'rgba(255, 211, 77, 0.16)',
        textMain: '#ffffff',
        textMuted: '#a8a69e',
        buttonGradient: 'linear-gradient(135deg, #FFE58A 0%, #D4A017 100%)',
        goldGradient: 'linear-gradient(135deg, #FFE58A 0%, #FFD34D 100%)'
      },
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Teko', sans-serif",
      borderRadius: '12px',
      glowIntensity: 'high'
    },
    blueGaming: {
      id: 'blueGaming',
      name: 'Blue Gaming',
      colors: {
        primary: '#00a8ff',
        primaryGlow: 'rgba(0, 168, 255, 0.55)',
        secondary: '#00e5ff',
        secondaryGlow: 'rgba(0, 229, 255, 0.45)',
        background: '#070b12',
        cardBg: 'rgba(12, 19, 32, 0.85)',
        cardBorder: 'rgba(0, 168, 255, 0.18)',
        textMain: '#ffffff',
        textMuted: '#8b9bb4',
        buttonGradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
        goldGradient: 'linear-gradient(135deg, #00e5ff 0%, #00a8ff 100%)'
      },
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Teko', sans-serif",
      borderRadius: '12px',
      glowIntensity: 'normal'
    },
    purpleNeon: {
      id: 'purpleNeon',
      name: 'Purple Neon',
      colors: {
        primary: '#a855f7',
        primaryGlow: 'rgba(168, 85, 247, 0.55)',
        secondary: '#ec4899',
        secondaryGlow: 'rgba(236, 72, 153, 0.45)',
        background: '#0c0714',
        cardBg: 'rgba(21, 14, 34, 0.85)',
        cardBorder: 'rgba(168, 85, 247, 0.18)',
        textMain: '#ffffff',
        textMuted: '#a39bb4',
        buttonGradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)',
        goldGradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)'
      },
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Teko', sans-serif",
      borderRadius: '12px',
      glowIntensity: 'high'
    },
    custom: {
      id: 'custom',
      name: 'Custom Theme',
      colors: {
        primary: '#FF3434',
        primaryGlow: 'rgba(255, 52, 52, 0.55)',
        secondary: '#FFD34D',
        secondaryGlow: 'rgba(255, 211, 77, 0.45)',
        background: '#0a0a0c',
        cardBg: 'rgba(18, 18, 22, 0.85)',
        cardBorder: 'rgba(255, 255, 255, 0.09)',
        textMain: '#ffffff',
        textMuted: '#9a9aa5',
        buttonGradient: 'linear-gradient(135deg, #FF3434 0%, #b81c1c 100%)',
        goldGradient: 'linear-gradient(135deg, #FFE58A 0%, #FFD34D 100%)'
      },
      fontFamily: "'Inter', system-ui, sans-serif",
      headingFont: "'Teko', sans-serif",
      borderRadius: '12px',
      glowIntensity: 'normal'
    }
  },

  // Security
  admin: {
    // SHA-256 for default password 'admin123'
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    sessionTimeoutMins: 120
  },

  // Initial reference teams (exact match to uploaded reference screenshot!)
  referenceTeamsGroupA: [
    { id: 'tm_1',  name: 'OutLaw',            logo: '', matches: 6, wins: 2, positionPoints: 50, killPoints: 120, total: 170, order: 1 },
    { id: 'tm_2',  name: 'ZERO GRAVITY xNS',  logo: '', matches: 5, wins: 2, positionPoints: 37, killPoints: 73,  total: 110, order: 2 },
    { id: 'tm_3',  name: 'FLAWLESS',          logo: '', matches: 6, wins: 1, positionPoints: 46, killPoints: 57,  total: 103, order: 3 },
    { id: 'tm_4',  name: 'VEXARCH',           logo: '', matches: 6, wins: 0, positionPoints: 37, killPoints: 31,  total: 68,  order: 4 },
    { id: 'tm_5',  name: 'WARBORN OFFICIAL',  logo: '', matches: 6, wins: 1, positionPoints: 33, killPoints: 31,  total: 64,  order: 5 },
    { id: 'tm_6',  name: 'MYSTIC WOLVES',     logo: '', matches: 6, wins: 1, positionPoints: 26, killPoints: 37,  total: 63,  order: 6 },
    { id: 'tm_7',  name: 'ESS 11',            logo: '', matches: 6, wins: 0, positionPoints: 25, killPoints: 32,  total: 57,  order: 7 },
    { id: 'tm_8',  name: 'DIVINE CORPSE',     logo: '', matches: 6, wins: 0, positionPoints: 25, killPoints: 31,  total: 56,  order: 8 },
    { id: 'tm_9',  name: 'UNO REVERSE',       logo: '', matches: 5, wins: 0, positionPoints: 16, killPoints: 29,  total: 45,  order: 9 },
    { id: 'tm_10', name: 'CHOSEN ONES',       logo: '', matches: 6, wins: 0, positionPoints: 17, killPoints: 20,  total: 37,  order: 10 },
    { id: 'tm_11', name: 'NO SKILL',          logo: '', matches: 6, wins: 0, positionPoints: 23, killPoints: 13,  total: 36,  order: 11 },
    { id: 'tm_12', name: 'ZERO LIMIT',        logo: '', matches: 3, wins: 0, positionPoints: 8,  killPoints: 3,   total: 11,  order: 12 }
  ]
};

// Generate default clean squad roster for new groups
function generateEmptyTeams(count = 12) {
  const teams = [];
  for (let i = 1; i <= count; i++) {
    teams.push({
      id: 'tm_gen_' + i + '_' + Math.random().toString(36).substr(2, 6),
      name: 'Squad ' + String(i).padStart(2, '0'),
      logo: '',
      matches: 0,
      wins: 0,
      positionPoints: 0,
      killPoints: 0,
      total: 0,
      order: i
    });
  }
  return teams;
}

// Global export
window.DEFAULT_CONFIG = DEFAULT_CONFIG;
window.generateEmptyTeams = generateEmptyTeams;
