/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Quick Point Update Panel Controller
 */

class QuickPointUpdateController {
  constructor() {
    this.form = null;
    this.groupSelect = null;
    this.teamSelect = null;
    this.matchInput = null;
    this.positionSelect = null;
    this.posPointsInput = null;
    this.killPointsInput = null;
    this.winCheckbox = null;
    this.saveBtn = null;
    this.resetBtn = null;
    this.undoBtn = null;
  }

  init() {
    this.groupSelect = document.getElementById('quickGroupSelect');
    this.teamSelect = document.getElementById('quickTeamSelect');
    this.matchInput = document.getElementById('quickMatchNumber');
    this.positionSelect = document.getElementById('quickPositionSelect');
    this.posPointsInput = document.getElementById('quickPositionPoints');
    this.killPointsInput = document.getElementById('quickKillPoints');
    this.winCheckbox = document.getElementById('quickWinCheck');
    this.saveBtn = document.getElementById('quickSaveMatchBtn');
    this.resetBtn = document.getElementById('quickResetFormBtn');
    this.undoBtn = document.getElementById('quickUndoBtn');

    this.populatePositionDropdown();
    this.populateGroupDropdown();
    this.populateTeamDropdown();
    this.bindEvents();

    // Listen to state changes
    window.tournamentState.subscribe((event) => {
      this.populateGroupDropdown();
      this.populateTeamDropdown();
      this.syncNextMatchNumber();
    });
  }

  bindEvents() {
    // Group select change
    if (this.groupSelect) {
      this.groupSelect.addEventListener('change', (e) => {
        window.groupsManager.switchGroup(e.target.value);
      });
    }

    // Position change -> auto calculate Position Points and Win check
    if (this.positionSelect) {
      this.positionSelect.addEventListener('change', () => {
        this.onPositionChange();
      });
    }

    // Save button
    if (this.saveBtn) {
      this.saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveMatchResult();
      });
    }

    // Reset button
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetForm();
      });
    }

    // Undo button
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.undoLastUpdate();
      });
    }

    // Auto calculate points on kill input
    if (this.killPointsInput) {
      this.killPointsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveMatchResult();
        }
      });
    }
  }

  populateGroupDropdown() {
    if (!this.groupSelect) return;
    const state = window.tournamentState.state;
    const current = state.activeGroup;
    this.groupSelect.innerHTML = (state.groupOrder || []).map(grp => `
      <option value="${grp}" ${grp === current ? 'selected' : ''}>${grp}</option>
    `).join('');
  }

  populateTeamDropdown() {
    if (!this.teamSelect) return;
    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.teams) {
      this.teamSelect.innerHTML = '<option value="">-- No Squads Available --</option>';
      return;
    }

    const previousValue = this.teamSelect.value;
    const options = group.teams.map(t => `
      <option value="${t.id}" ${t.id === previousValue ? 'selected' : ''}>
        ${t.name} (Pts: ${t.total || 0})
      </option>
    `);

    this.teamSelect.innerHTML = `
      <option value="">-- Select Squad --</option>
      ${options.join('')}
    `;

    if (previousValue && group.teams.some(t => t.id === previousValue)) {
      this.teamSelect.value = previousValue;
    }
  }

  populatePositionDropdown() {
    if (!this.positionSelect) return;
    const scoring = window.tournamentState.state ? window.tournamentState.state.scoring : DEFAULT_CONFIG.scoring;
    const placementMap = scoring.placementPoints || {};

    let html = '<option value="">-- Select Finish Position --</option>';
    for (let pos = 1; pos <= 16; pos++) {
      const defaultPts = placementMap[pos] !== undefined ? placementMap[pos] : 0;
      const label = pos === 1 ? '1st Place (Booyah / #1)' : `${pos}${this.getOrdinalSuffix(pos)} Place`;
      html += `<option value="${pos}">${label} [${defaultPts} Pos Pts]</option>`;
    }
    this.positionSelect.innerHTML = html;
  }

  getOrdinalSuffix(i) {
    const j = i % 10, k = i % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  onPositionChange() {
    const pos = parseInt(this.positionSelect.value);
    if (!pos || isNaN(pos)) {
      if (this.posPointsInput) this.posPointsInput.value = '';
      if (this.winCheckbox) this.winCheckbox.checked = false;
      return;
    }

    const scoring = window.tournamentState.state.scoring;
    const pts = scoring.placementPoints[pos] !== undefined ? scoring.placementPoints[pos] : 0;

    if (this.posPointsInput) {
      this.posPointsInput.value = pts;
    }

    if (this.winCheckbox) {
      this.winCheckbox.checked = (pos === 1);
    }
  }

  syncNextMatchNumber() {
    if (!this.matchInput) return;
    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.history || !group.history.length) {
      if (!this.matchInput.value || parseInt(this.matchInput.value) <= 1) {
        this.matchInput.value = 1;
      }
      return;
    }
    // Calculate max match number recorded so far
    const maxMatch = Math.max(...group.history.map(h => h.matchNumber || 1));
    if (!this.matchInput.value || this.matchInput.value === '1') {
      this.matchInput.value = maxMatch;
    }
  }

  selectTeamForUpdate(teamId) {
    if (!this.teamSelect) return;
    this.teamSelect.value = teamId;
    if (this.killPointsInput) {
      this.killPointsInput.focus();
    }
    window.app.showToast(`Selected squad for quick point update`);
  }

  saveMatchResult() {
    const teamId = this.teamSelect ? this.teamSelect.value : '';
    if (!teamId) {
      window.app.showToast('Please select a squad first!', 'warning');
      if (this.teamSelect) this.teamSelect.focus();
      return;
    }

    const matchNo = Math.max(1, parseInt(this.matchInput.value) || 1);
    const pos = parseInt(this.positionSelect.value) || 0;
    const posPts = Math.max(0, parseFloat(this.posPointsInput.value) || 0);
    const kills = Math.max(0, parseInt(this.killPointsInput.value) || 0);
    const killWeight = window.tournamentState.state.scoring.killWeight || 1;
    const killPts = kills * killWeight;
    const isWin = this.winCheckbox ? this.winCheckbox.checked : (pos === 1);
    const matchTotal = Math.round((posPts + killPts) * 100) / 100;

    const group = window.tournamentState.getActiveGroup();
    if (!group) return;

    const team = group.teams.find(t => t.id === teamId);
    if (!team) return;

    // Push undo snapshot
    window.tournamentState.pushUndoSnapshot();

    // Update team stats
    team.matches = (team.matches || 0) + 1;
    if (isWin) team.wins = (team.wins || 0) + 1;
    team.positionPoints = Math.round(((team.positionPoints || 0) + posPts) * 100) / 100;
    team.killPoints = Math.round(((team.killPoints || 0) + killPts) * 100) / 100;
    team.total = Math.round(((team.positionPoints || 0) + (team.killPoints || 0) * killWeight) * 100) / 100;

    // Create Match History record
    const historyItem = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      matchNumber: matchNo,
      teamId: team.id,
      teamName: team.name,
      position: pos,
      positionPoints: posPts,
      kills: kills,
      killPoints: killPts,
      totalPoints: matchTotal,
      isWin: isWin
    };

    if (!Array.isArray(group.history)) group.history = [];
    group.history.unshift(historyItem);

    // Save and re-render
    window.tournamentState.save();

    // Trigger visual flash on leaderboard row
    setTimeout(() => {
      const row = document.querySelector(`.team-row[data-team-id="${team.id}"]`);
      if (row) {
        row.classList.add('row-update-flash');
        setTimeout(() => row.classList.remove('row-update-flash'), 1800);
      }
    }, 50);

    // Play subtle audio if enabled
    window.app.playSound('success');

    // Show toast
    window.app.showToast(`Match ${matchNo} saved: ${team.name} (+${matchTotal} Pts)`);

    // Reset inputs for next entry, keeping match number
    if (this.positionSelect) this.positionSelect.value = '';
    if (this.posPointsInput) this.posPointsInput.value = '';
    if (this.killPointsInput) this.killPointsInput.value = '';
    if (this.winCheckbox) this.winCheckbox.checked = false;
    this.populateTeamDropdown();
  }

  resetForm() {
    if (this.teamSelect) this.teamSelect.value = '';
    if (this.positionSelect) this.positionSelect.value = '';
    if (this.posPointsInput) this.posPointsInput.value = '';
    if (this.killPointsInput) this.killPointsInput.value = '';
    if (this.winCheckbox) this.winCheckbox.checked = false;
    window.app.showToast('Form reset');
  }

  undoLastUpdate() {
    const success = window.tournamentState.undoLast();
    if (success) {
      window.app.playSound('undo');
      window.app.showToast('Last point update undone');
    } else {
      window.app.showToast('Nothing to undo', 'warning');
    }
  }
}

// Global instance
window.quickUpdate = new QuickPointUpdateController();
