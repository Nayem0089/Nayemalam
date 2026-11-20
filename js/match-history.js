/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Match History & Audit Log Controller
 */

class MatchHistoryController {
  constructor() {
    this.container = null;
    this.filterTeamSelect = null;
    this.filterMatchSelect = null;
    this.selectedTeamFilter = '';
    this.selectedMatchFilter = '';
    this.editingRecordId = null;
  }

  init() {
    this.container = document.getElementById('historyList');
    this.filterTeamSelect = document.getElementById('historyTeamFilter');
    this.filterMatchSelect = document.getElementById('historyMatchFilter');

    this.bindEvents();
    this.render();

    window.tournamentState.subscribe(() => {
      this.populateFilterDropdowns();
      this.render();
    });
  }

  bindEvents() {
    if (this.filterTeamSelect) {
      this.filterTeamSelect.addEventListener('change', (e) => {
        this.selectedTeamFilter = e.target.value;
        this.render();
      });
    }

    if (this.filterMatchSelect) {
      this.filterMatchSelect.addEventListener('change', (e) => {
        this.selectedMatchFilter = e.target.value;
        this.render();
      });
    }

    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.confirmClearHistory();
      });
    }

    const undoLatestBtn = document.getElementById('undoLatestHistBtn');
    if (undoLatestBtn) {
      undoLatestBtn.addEventListener('click', () => {
        this.undoLatestRecord();
      });
    }
  }

  populateFilterDropdowns() {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;

    // Team Filter
    if (this.filterTeamSelect) {
      const current = this.filterTeamSelect.value;
      const teams = group.teams || [];
      this.filterTeamSelect.innerHTML = `
        <option value="">All Squads</option>
        ${teams.map(t => `<option value="${t.id}" ${t.id === current ? 'selected' : ''}>${t.name}</option>`).join('')}
      `;
    }

    // Match Filter
    if (this.filterMatchSelect) {
      const current = this.filterMatchSelect.value;
      const history = group.history || [];
      const matchNumbers = [...new Set(history.map(h => h.matchNumber))].sort((a, b) => a - b);
      this.filterMatchSelect.innerHTML = `
        <option value="">All Matches</option>
        ${matchNumbers.map(m => `<option value="${m}" ${String(m) === current ? 'selected' : ''}>Match ${m}</option>`).join('')}
      `;
    }
  }

  render() {
    if (!this.container) return;

    const group = window.tournamentState.getActiveGroup();
    const histCountEl = document.getElementById('histCountBadge');

    if (!group || !Array.isArray(group.history) || !group.history.length) {
      if (histCountEl) histCountEl.textContent = '0 records';
      this.container.innerHTML = `
        <div class="empty-history">
          <div class="empty-hist-icon">🕒</div>
          <div class="empty-hist-text">No match history for ${group ? group.label : 'this group'}.</div>
          <div class="empty-hist-sub">Add scores from the Quick Point Update panel above.</div>
        </div>
      `;
      return;
    }

    let records = [...group.history];

    // Filter by team
    if (this.selectedTeamFilter) {
      records = records.filter(r => r.teamId === this.selectedTeamFilter);
    }

    // Filter by match
    if (this.selectedMatchFilter) {
      records = records.filter(r => String(r.matchNumber) === this.selectedMatchFilter);
    }

    if (histCountEl) {
      histCountEl.textContent = `${records.length} record${records.length !== 1 ? 's' : ''}`;
    }

    if (!records.length) {
      this.container.innerHTML = `<div class="empty-history">No records match the current filter.</div>`;
      return;
    }

    const isAdmin = window.adminManager ? window.adminManager.isAdmin : false;

    let html = '';
    records.forEach(rec => {
      const timeStr = this.formatTime(rec.timestamp);
      const isBooyah = rec.position === 1 || rec.isWin;
      const posLabel = rec.position ? (rec.position === 1 ? '1st 🏆' : `${rec.position}${window.quickUpdate.getOrdinalSuffix(rec.position)}`) : '-';

      const actions = isAdmin ? `
        <div class="hist-actions">
          <button class="hist-action-btn edit" onclick="window.matchHistory.openEditModal('${rec.id}')" title="Edit this record">✎</button>
          <button class="hist-action-btn delete" onclick="window.matchHistory.confirmDeleteRecord('${rec.id}')" title="Delete record and rollback points">×</button>
        </div>
      ` : '';

      html += `
        <div class="history-item ${isBooyah ? 'booyah-item' : ''}" data-id="${rec.id}">
          <div class="hist-header">
            <span class="hist-match-pill">MATCH ${rec.matchNumber}</span>
            <span class="hist-team-name">${rec.teamName}</span>
            <span class="hist-pos-badge ${isBooyah ? 'booyah' : ''}">${posLabel}</span>
            ${actions}
          </div>
          <div class="hist-body">
            <div class="hist-stat-breakdown">
              <span class="hist-stat pos">+${rec.positionPoints || 0} PP</span>
              <span class="hist-stat plus">+</span>
              <span class="hist-stat kill">${rec.kills || 0} Kills (${rec.killPoints || 0} KP)</span>
              <span class="hist-stat equals">=</span>
              <span class="hist-stat total">+${rec.totalPoints || 0} PTS</span>
            </div>
            <span class="hist-time">${timeStr}</span>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = html;
  }

  formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  undoLatestRecord() {
    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.history || !group.history.length) {
      window.app.showToast('No match records to undo', 'warning');
      return;
    }

    const latest = group.history[0];
    this.deleteRecord(latest.id, true);
  }

  confirmClearHistory() {
    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.history || !group.history.length) {
      window.app.showToast('History is already empty', 'warning');
      return;
    }

    window.app.showConfirmDialog(
      'Clear Match History',
      `Clear all ${group.history.length} match records for <b>${group.label}</b>?<br><br><span style="color:#ffd34d;">Note: Squad cumulative points on the leaderboard will remain intact.</span>`,
      () => {
        window.tournamentState.pushUndoSnapshot();
        group.history = [];
        window.tournamentState.save();
        this.render();
        window.app.showToast(`Cleared history for ${group.label}`);
      }
    );
  }

  confirmDeleteRecord(recordId) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;
    const record = group.history.find(r => r.id === recordId);
    if (!record) return;

    window.app.showConfirmDialog(
      'Delete Match Result',
      `Delete Match ${record.matchNumber} result for <b>${record.teamName}</b>?<br><br>This will rollback <b>${record.totalPoints} points</b> from the squad's total score.`,
      () => {
        this.deleteRecord(recordId);
      }
    );
  }

  deleteRecord(recordId, isUndo = false) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;

    const index = group.history.findIndex(r => r.id === recordId);
    if (index === -1) return;

    const record = group.history[index];
    const team = group.teams.find(t => t.id === record.teamId);

    window.tournamentState.pushUndoSnapshot();

    // Rollback squad statistics
    if (team) {
      team.matches = Math.max(0, (team.matches || 0) - 1);
      if (record.isWin || record.position === 1) {
        team.wins = Math.max(0, (team.wins || 0) - 1);
      }
      team.positionPoints = Math.max(0, Math.round(((team.positionPoints || 0) - (record.positionPoints || 0)) * 100) / 100);
      team.killPoints = Math.max(0, Math.round(((team.killPoints || 0) - (record.killPoints || 0)) * 100) / 100);
      const killWeight = window.tournamentState.state.scoring.killWeight || 1;
      team.total = Math.round(((team.positionPoints || 0) + (team.killPoints || 0) * killWeight) * 100) / 100;
    }

    // Save to recycle bin
    window.tournamentState.state.recycleBin.push({
      type: 'history_record',
      group: group.label,
      data: record,
      timestamp: Date.now()
    });

    // Remove from history
    group.history.splice(index, 1);
    window.tournamentState.save();

    this.render();
    window.app.showToast(isUndo ? 'Undone latest match update' : 'Match record deleted and points rolled back');
  }

  openEditModal(recordId) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;
    const record = group.history.find(r => r.id === recordId);
    if (!record) return;

    this.editingRecordId = recordId;

    // Populate edit record modal inputs
    document.getElementById('editRecSquadName').textContent = record.teamName;
    document.getElementById('editRecMatchNo').value = record.matchNumber;
    document.getElementById('editRecPosition').value = record.position;
    document.getElementById('editRecPosPts').value = record.positionPoints;
    document.getElementById('editRecKills').value = record.kills;
    document.getElementById('editRecWin').checked = record.isWin || record.position === 1;

    window.app.openModal('editHistoryModal');
  }

  saveEditedRecord() {
    if (!this.editingRecordId) return;
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;
    const record = group.history.find(r => r.id === this.editingRecordId);
    if (!record) return;

    const team = group.teams.find(t => t.id === record.teamId);
    if (!team) return;

    const newMatchNo = Math.max(1, parseInt(document.getElementById('editRecMatchNo').value) || 1);
    const newPos = parseInt(document.getElementById('editRecPosition').value) || 0;
    const newPosPts = Math.max(0, parseFloat(document.getElementById('editRecPosPts').value) || 0);
    const newKills = Math.max(0, parseInt(document.getElementById('editRecKills').value) || 0);
    const newIsWin = document.getElementById('editRecWin').checked;
    const killWeight = window.tournamentState.state.scoring.killWeight || 1;
    const newKillPts = newKills * killWeight;
    const newTotalPts = Math.round((newPosPts + newKillPts) * 100) / 100;

    window.tournamentState.pushUndoSnapshot();

    // Rollback old delta and apply new
    const oldPosPts = record.positionPoints || 0;
    const oldKillPts = record.killPoints || 0;
    const oldWin = (record.isWin || record.position === 1) ? 1 : 0;
    const newWin = (newIsWin || newPos === 1) ? 1 : 0;

    team.wins = Math.max(0, (team.wins || 0) - oldWin + newWin);
    team.positionPoints = Math.max(0, Math.round(((team.positionPoints || 0) - oldPosPts + newPosPts) * 100) / 100);
    team.killPoints = Math.max(0, Math.round(((team.killPoints || 0) - oldKillPts + newKillPts) * 100) / 100);
    team.total = Math.round(((team.positionPoints || 0) + (team.killPoints || 0) * killWeight) * 100) / 100;

    // Update record
    record.matchNumber = newMatchNo;
    record.position = newPos;
    record.positionPoints = newPosPts;
    record.kills = newKills;
    record.killPoints = newKillPts;
    record.totalPoints = newTotalPts;
    record.isWin = newIsWin;

    window.tournamentState.save();
    window.app.closeModal('editHistoryModal');
    this.render();
    window.app.showToast(`Updated Match ${newMatchNo} for ${team.name}`);
  }
}

// Global instance
window.matchHistory = new MatchHistoryController();
