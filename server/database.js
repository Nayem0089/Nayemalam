/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * SQLite Database Manager
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'tournament.db');

class DatabaseManager {
  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error connecting to SQLite database:', err);
      } else {
        console.log('Connected to SQLite tournament database:', DB_PATH);
        this.initTables();
      }
    });
  }

  initTables() {
    this.db.serialize(() => {
      // Tournament full state table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tournament_state (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Match records table for audit log
      this.db.run(`
        CREATE TABLE IF NOT EXISTS match_records (
          id TEXT PRIMARY KEY,
          group_name TEXT NOT NULL,
          match_number INTEGER NOT NULL,
          team_id TEXT NOT NULL,
          team_name TEXT NOT NULL,
          position INTEGER,
          pos_points REAL,
          kills INTEGER,
          kill_points REAL,
          total_points REAL,
          is_win INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  }

  saveState(stateJson) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO tournament_state (id, data, updated_at)
        VALUES ('current', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(stateJson, function (err) {
        if (err) reject(err);
        else resolve({ id: 'current', changes: this.changes });
      });
      stmt.finalize();
    });
  }

  getState() {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT data FROM tournament_state WHERE id = 'current'`, (err, row) => {
        if (err) reject(err);
        else resolve(row ? JSON.parse(row.data) : null);
      });
    });
  }

  recordMatch(record) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO match_records (id, group_name, match_number, team_id, team_name, position, pos_points, kills, kill_points, total_points, is_win)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.id,
        record.groupName,
        record.matchNumber,
        record.teamId,
        record.teamName,
        record.position,
        record.posPoints,
        record.kills,
        record.killPoints,
        record.totalPoints,
        record.isWin ? 1 : 0,
        function (err) {
          if (err) reject(err);
          else resolve({ id: record.id, changes: this.changes });
        }
      );
      stmt.finalize();
    });
  }
}

module.exports = new DatabaseManager();
