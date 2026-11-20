/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * State Management & Storage Engine
 */

const STORAGE_KEY = 'esports_tournament_manager_state_v1';
const DB_NAME = 'EsportsTournamentDB';
const DB_STORE = 'tournament_state';

class TournamentStateManager {
  constructor() {
    this.state = null;
    this.subscribers = [];
    this.undoStack = [];
    this.isServerConnected = false;
    this.serverBaseUrl = 'http://localhost:8080/api';
    this.autoSaveTimer = null;
  }

  // Generate initial state
  getDefaultState() {
    return {
      version: '1.0.0',
      settings: JSON.parse(JSON.stringify(DEFAULT_CONFIG.branding)),
      scoring: JSON.parse(JSON.stringify(DEFAULT_CONFIG.scoring)),
      currentTheme: 'redEsports',
      customTheme: JSON.parse(JSON.stringify(DEFAULT_CONFIG.themes.custom)),
      activeGroup: 'GROUP A',
      groupOrder: ['GROUP A', 'GROUP B', 'GROUP C', 'GROUP D'],
      autoRanking: true,
      displayOptions: {
        showMatches: true,
        showWins: true,
        showPosPts: true,
        showKillPts: true,
        showTotal: true,
        compactMode: false,
        soundEffects: true
      },
      groups: {
        'GROUP A': {
          id: 'grp_a',
          label: 'GROUP A',
          teams: JSON.parse(JSON.stringify(DEFAULT_CONFIG.referenceTeamsGroupA)),
          history: [
            {
              id: 'hist_init_1',
              timestamp: Date.now() - 3600000 * 5,
              matchNumber: 1,
              teamId: 'tm_1',
              teamName: 'OutLaw',
              position: 1,
              positionPoints: 12,
              kills: 22,
              killPoints: 22,
              totalPoints: 34,
              notes: 'Match 1 Booyah'
            },
            {
              id: 'hist_init_2',
              timestamp: Date.now() - 3600000 * 4,
              matchNumber: 2,
              teamId: 'tm_2',
              teamName: 'ZERO GRAVITY xNS',
              position: 1,
              positionPoints: 12,
              kills: 18,
              killPoints: 18,
              totalPoints: 30,
              notes: 'Match 2 Booyah'
            }
          ]
        },
        'GROUP B': {
          id: 'grp_b',
          label: 'GROUP B',
          teams: generateEmptyTeams(12),
          history: []
        },
        'GROUP C': {
          id: 'grp_c',
          label: 'GROUP C',
          teams: generateEmptyTeams(12),
          history: []
        },
        'GROUP D': {
          id: 'grp_d',
          label: 'GROUP D',
          teams: generateEmptyTeams(12),
          history: []
        }
      },
      recycleBin: [] // Deleted matches/teams for restore capability
    };
  }

  // Initialize state from storage / server
  async init() {
    let loadedState = null;

    // 1. Check local storage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        loadedState = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }

    // 2. Fallback to IndexedDB if localStorage was empty
    if (!loadedState) {
      try {
        loadedState = await this.loadFromIndexedDB();
      } catch (err) {
        console.warn('IndexedDB read error:', err);
      }
    }

    // 3. Fallback to default
    if (!loadedState || !loadedState.groups || !loadedState.groups['GROUP A']) {
      loadedState = this.getDefaultState();
    } else {
      // Merge with default to ensure no missing properties
      const def = this.getDefaultState();
      loadedState.settings = Object.assign({}, def.settings, loadedState.settings || {});
      loadedState.scoring = Object.assign({}, def.scoring, loadedState.scoring || {});
      loadedState.displayOptions = Object.assign({}, def.displayOptions, loadedState.displayOptions || {});
      if (!loadedState.groupOrder || !loadedState.groupOrder.length) {
        loadedState.groupOrder = Object.keys(loadedState.groups);
      }
      if (!loadedState.activeGroup || !loadedState.groups[loadedState.activeGroup]) {
        loadedState.activeGroup = loadedState.groupOrder[0] || 'GROUP A';
      }
    }

    this.state = loadedState;

    // Save initial state
    this.save();

    // Check optional background server sync
    this.checkServerSync();

    return this.state;
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notify(eventType, payload) {
    this.subscribers.forEach(fn => {
      try {
        fn(eventType, payload, this.state);
      } catch (e) {
        console.error('State subscriber error:', e);
      }
    });
  }

  // Save current state persistently
  save(recordUndo = false) {
    if (!this.state) return;

    if (recordUndo) {
      this.pushUndoSnapshot();
    }

    // Debounced persist
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.persistNow();
    }, 150);

    this.notify('update', { activeGroup: this.state.activeGroup });
  }

  persistNow() {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY, serialized);
      this.saveToIndexedDB(this.state);
      this.syncToServer();
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }

  // Push snapshot for Undo
  pushUndoSnapshot() {
    const snapshot = JSON.stringify({
      activeGroup: this.state.activeGroup,
      groupData: this.state.groups[this.state.activeGroup]
    });
    this.undoStack.push(snapshot);
    if (this.undoStack.length > 25) {
      this.undoStack.shift();
    }
  }

  // Undo last operation
  undoLast() {
    if (!this.undoStack.length) return false;
    const previous = JSON.parse(this.undoStack.pop());
    if (previous && previous.groupData && this.state.groups[previous.activeGroup]) {
      this.state.groups[previous.activeGroup] = previous.groupData;
      this.save(false);
      this.notify('undo', { group: previous.activeGroup });
      return true;
    }
    return false;
  }

  // Get active group data
  getActiveGroup() {
    if (!this.state || !this.state.groups) return null;
    return this.state.groups[this.state.activeGroup] || null;
  }

  // Update a team's score directly
  updateTeamScore(teamId, delta = {}) {
    const group = this.getActiveGroup();
    if (!group) return null;

    const team = group.teams.find(t => t.id === teamId);
    if (!team) return null;

    this.pushUndoSnapshot();

    if (delta.matches !== undefined) team.matches = Math.max(0, team.matches + delta.matches);
    if (delta.wins !== undefined) team.wins = Math.max(0, team.wins + delta.wins);
    if (delta.positionPoints !== undefined) team.positionPoints = Math.max(0, team.positionPoints + delta.positionPoints);
    if (delta.killPoints !== undefined) team.killPoints = Math.max(0, team.killPoints + delta.killPoints);

    // Auto-recalculate total points
    team.total = Math.round((team.positionPoints + team.killPoints * (this.state.scoring.killWeight || 1)) * 100) / 100;

    this.save();
    return team;
  }

  // Recalculate all teams in active group
  recalculateActiveGroup() {
    const group = this.getActiveGroup();
    if (!group) return;
    const killWeight = this.state.scoring.killWeight || 1;
    group.teams.forEach(t => {
      t.total = Math.round(((Number(t.positionPoints) || 0) + (Number(t.killPoints) || 0) * killWeight) * 100) / 100;
    });
    this.save();
  }

  // IndexedDB operations
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e);
    });
  }

  async saveToIndexedDB(data) {
    try {
      const db = await this.openDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put(data, 'current_state');
    } catch (e) {
      // silently ignore if IndexedDB is blocked in private browsing
    }
  }

  async loadFromIndexedDB() {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get('current_state');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  // Check optional local server sync
  async checkServerSync() {
    try {
      const res = await fetch(`${this.serverBaseUrl}/ping`, { method: 'GET' });
      if (res.ok) {
        this.isServerConnected = true;
        console.log('✅ Connected to local tournament SQLite server');
      }
    } catch (e) {
      this.isServerConnected = false;
    }
  }

  async syncToServer() {
    if (!this.isServerConnected) return;
    try {
      await fetch(`${this.serverBaseUrl}/tournament`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state)
      });
    } catch (e) {
      // server offline
    }
  }
}

// Global instance
window.tournamentState = new TournamentStateManager();
