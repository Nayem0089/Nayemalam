/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Leaderboard Component & Dynamic Ranking Engine
 */

class LeaderboardComponent {
  constructor() {
    this.container = null;
    this.tableBody = null;
    this.previousRanks = {};
    this.draggedTeamId = null;
    this.searchQuery = '';
  }

  init() {
    this.container = document.getElementById('captureArea');
    this.tableBody = document.getElementById('teamRows');
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Listen to state changes
    window.tournamentState.subscribe((event, payload) => {
      this.render();
    });

    // Search filter
    const searchInput = document.getElementById('teamSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Auto-ranking toggle
    const autoRankToggle = document.getElementById('autoRankToggle');
    if (autoRankToggle) {
      autoRankToggle.addEventListener('change', (e) => {
        window.tournamentState.state.autoRanking = e.target.checked;
        window.tournamentState.save();
        this.render();
        window.app.showToast(e.target.checked ? 'Auto-ranking enabled' : 'Manual ranking mode active');
      });
    }
  }

  // Calculate sorted teams based on rules or manual order
  getSortedTeams() {
    const group = window.tournamentState.getActiveGroup();
    if (!group || !Array.isArray(group.teams)) return [];

    let teams = [...group.teams];

    // Filter by search query if any
    if (this.searchQuery) {
      teams = teams.filter(t => t.name.toLowerCase().includes(this.searchQuery));
    }

    const isAutoRank = window.tournamentState.state.autoRanking;

    if (isAutoRank) {
      const scoring = window.tournamentState.state.scoring;
      const killWeight = scoring.killWeight || 1;

      teams.sort((a, b) => {
        // Ensure total is up-to-date
        const totalA = Number(a.positionPoints || 0) + Number(a.killPoints || 0) * killWeight;
        const totalB = Number(b.positionPoints || 0) + Number(b.killPoints || 0) * killWeight;

        if (totalB !== totalA) return totalB - totalA;
        if ((b.wins || 0) !== (a.wins || 0)) return (b.wins || 0) - (a.wins || 0);
        if ((b.killPoints || 0) !== (a.killPoints || 0)) return (b.killPoints || 0) - (a.killPoints || 0);
        return (b.positionPoints || 0) - (a.positionPoints || 0);
      });
    } else {
      // Manual order
      teams.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return teams;
  }

  render() {
    this.renderHeader();
    this.renderTable();
    this.renderFooter();
  }

  renderHeader() {
    const state = window.tournamentState.state;
    const settings = state.settings;
    const activeGroup = state.activeGroup;

    // Logo
    const logoSlot = document.getElementById('logoSlot');
    const logoImg = document.getElementById('tournamentLogoImg');
    const logoMono = document.getElementById('logoMono');

    if (settings.tournamentLogo || settings.websiteLogo) {
      const logoSrc = settings.tournamentLogo || settings.websiteLogo;
      logoImg.src = logoSrc;
      logoImg.style.display = 'block';
      if (logoMono) logoMono.style.display = 'none';
    } else {
      logoImg.style.display = 'none';
      if (logoMono) {
        logoMono.style.display = 'block';
        logoMono.textContent = (settings.websiteName || 'WZ').substring(0, 2).toUpperCase();
      }
    }

    // Header text fields
    const fldOrg = document.getElementById('fldOrgName');
    const fldTourn = document.getElementById('fldTournamentName');
    const fldSub = document.getElementById('fldSubtitle');
    const fldInfo = document.getElementById('fldMatchInfo');
    const pillGroup = document.getElementById('groupPillDisplay');

    if (fldOrg) fldOrg.textContent = settings.websiteName || 'WARZONE OFFICIAL';
    if (fldTourn) fldTourn.textContent = settings.tournamentName || 'DAILY PAID SCRIM';
    if (fldSub) fldSub.textContent = settings.tournamentSubtitle || 'OVERALL STANDINGS';
    if (fldInfo) fldInfo.textContent = settings.matchInfoLine || 'WEEK 01 DAY 01';
    if (pillGroup) pillGroup.textContent = activeGroup;

    // In admin mode, make fields contenteditable
    const isAdmin = window.adminManager ? window.adminManager.isAdmin : false;
    [fldOrg, fldTourn, fldSub, fldInfo].forEach(el => {
      if (!el) return;
      el.contentEditable = isAdmin ? 'true' : 'false';
      el.classList.toggle('editable-active', isAdmin);
    });
  }

  renderTable() {
    if (!this.tableBody) return;

    const teams = this.getSortedTeams();
    const isAdmin = window.adminManager ? window.adminManager.isAdmin : false;
    const isAutoRank = window.tournamentState.state.autoRanking;
    const killWeight = window.tournamentState.state.scoring.killWeight || 1;

    if (!teams.length) {
      this.tableBody.innerHTML = `
        <div class="empty-leaderboard">
          <div class="empty-icon">🛡️</div>
          <div class="empty-title">No Squads in this Group</div>
          <div class="empty-desc">${isAdmin ? 'Add squads from the Roster editor or right-side panel.' : 'Tournament standings will appear here.'}</div>
          ${isAdmin ? `<button class="btn btn-red btn-sm" onclick="window.settingsManager.openTab('squads')">+ Add Squads</button>` : ''}
        </div>
      `;
      return;
    }

    let rowsHtml = '';

    teams.forEach((team, index) => {
      const rank = index + 1;
      const prevRank = this.previousRanks[team.id];
      let rankTrend = '';

      if (prevRank && prevRank !== rank) {
        if (rank < prevRank) {
          rankTrend = `<span class="rank-trend up" title="Moved up from #${prevRank}">▲ ${prevRank - rank}</span>`;
        } else {
          rankTrend = `<span class="rank-trend down" title="Moved down from #${prevRank}">▼ ${rank - prevRank}</span>`;
        }
      }

      // Calculate total
      const totalPoints = Math.round(((Number(team.positionPoints) || 0) + (Number(team.killPoints) || 0) * killWeight) * 100) / 100;
      team.total = totalPoints;

      // Special styling classes
      const isTop1 = rank === 1;
      const isTop2 = rank === 2;
      const isTop3 = rank === 3;
      const rankClass = isTop1 ? 'rank-1' : (isTop2 ? 'rank-2' : (isTop3 ? 'rank-3' : ''));

      // Trophy / Medal icon
      let trophyIcon = '';
      if (isTop1) {
        trophyIcon = `<span class="team-trophy gold" title="1st Place - Leader">🏆</span>`;
      } else if (isTop2) {
        trophyIcon = `<span class="team-trophy silver" title="2nd Place">🥈</span>`;
      } else if (isTop3) {
        trophyIcon = `<span class="team-trophy bronze" title="3rd Place">🥉</span>`;
      }

      // Team Logo or monogram
      let logoHtml = '';
      if (team.logo) {
        logoHtml = `<img class="team-row-logo" src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'">`;
      }

      // Drag handle for manual reordering
      const dragHandle = (isAdmin && !isAutoRank)
        ? `<span class="drag-grip" title="Drag to reorder">⠿</span>`
        : '';

      // Editable inputs vs static values
      const nameContent = isAdmin
        ? `<span class="team-name-text" data-team-id="${team.id}" data-field="name" contenteditable="true" spellcheck="false">${team.name}</span>`
        : `<span class="team-name-text">${team.name}</span>`;

      const matchesCell = isAdmin
        ? `<input type="number" class="stat-input stat-matches" data-team-id="${team.id}" data-field="matches" value="${team.matches || 0}" min="0">`
        : `<span class="stat-value">${team.matches || 0}</span>`;

      const winsCell = isAdmin
        ? `<input type="number" class="stat-input stat-wins" data-team-id="${team.id}" data-field="wins" value="${team.wins || 0}" min="0">`
        : `<span class="stat-value">${team.wins || 0}</span>`;

      const posCell = isAdmin
        ? `<input type="number" class="stat-input stat-pos" data-team-id="${team.id}" data-field="positionPoints" value="${team.positionPoints || 0}" min="0">`
        : `<span class="stat-value pos-highlight">${team.positionPoints || 0}</span>`;

      const killCell = isAdmin
        ? `<input type="number" class="stat-input stat-kill" data-team-id="${team.id}" data-field="killPoints" value="${team.killPoints || 0}" min="0">`
        : `<span class="stat-value kill-highlight">${team.killPoints || 0}</span>`;

      // Total Points Pill Badge
      const totalBadgeClass = isTop1 ? 'total-pill gold' : 'total-pill red';
      const totalCell = `<div class="${totalBadgeClass}"><span class="total-number">${totalPoints}</span></div>`;

      // Admin Quick Actions (Inline delete or edit)
      const adminActions = isAdmin
        ? `<div class="row-admin-actions">
             <button class="row-action-btn edit" onclick="window.quickUpdate.selectTeamForUpdate('${team.id}')" title="Quick Update Squad">⚡</button>
             <button class="row-action-btn delete" onclick="window.leaderboard.confirmDeleteTeam('${team.id}')" title="Delete Squad">×</button>
           </div>`
        : '';

      rowsHtml += `
        <div class="team-row ${rankClass}" data-team-id="${team.id}" data-rank="${rank}" draggable="${isAdmin && !isAutoRank ? 'true' : 'false'}">
          ${dragHandle}
          <div class="rank-col">
            <div class="rank-box">
              <span class="rank-digit">${rank}</span>
            </div>
            ${rankTrend}
          </div>
          
          <div class="team-name-col ${isTop1 ? 'top1-border-glow' : ''}">
            ${trophyIcon}
            ${logoHtml}
            ${nameContent}
          </div>

          <div class="stat-col col-matches">${matchesCell}</div>
          <div class="stat-col col-wins">${winsCell}</div>
          <div class="stat-col col-pos">${posCell}</div>
          <div class="stat-col col-kill">${killCell}</div>
          <div class="stat-col col-total">${totalCell}</div>
          ${adminActions}
        </div>
      `;
    });

    this.tableBody.innerHTML = rowsHtml;

    // Cache ranks for trend indicators
    const currentRanks = {};
    teams.forEach((t, i) => { currentRanks[t.id] = i + 1; });
    this.previousRanks = currentRanks;

    // Attach row events
    this.attachRowEvents();
  }

  attachRowEvents() {
    const isAdmin = window.adminManager ? window.adminManager.isAdmin : false;

    // Editable stat inputs
    this.tableBody.querySelectorAll('.stat-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const teamId = e.target.getAttribute('data-team-id');
        const field = e.target.getAttribute('data-field');
        const val = Math.max(0, parseInt(e.target.value) || 0);

        const group = window.tournamentState.getActiveGroup();
        const team = group.teams.find(t => t.id === teamId);
        if (team) {
          window.tournamentState.pushUndoSnapshot();
          team[field] = val;
          const killWeight = window.tournamentState.state.scoring.killWeight || 1;
          team.total = Math.round(((Number(team.positionPoints) || 0) + (Number(team.killPoints) || 0) * killWeight) * 100) / 100;
          window.tournamentState.save();
          this.render();
          window.app.showToast(`Updated ${team.name} ${field}: ${val}`);
        }
      });
    });

    // Contenteditable team name
    this.tableBody.querySelectorAll('.team-name-text[contenteditable="true"]').forEach(el => {
      el.addEventListener('blur', (e) => {
        const teamId = e.target.getAttribute('data-team-id');
        const newName = e.target.textContent.trim();
        const group = window.tournamentState.getActiveGroup();
        const team = group.teams.find(t => t.id === teamId);
        if (team && newName && team.name !== newName) {
          window.tournamentState.pushUndoSnapshot();
          team.name = newName;
          window.tournamentState.save();
          window.app.showToast(`Renamed to "${newName}"`);
        }
      });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.target.blur();
        }
      });
    });

    // Drag and Drop reordering (when manual ranking is active)
    if (isAdmin && !window.tournamentState.state.autoRanking) {
      const rows = this.tableBody.querySelectorAll('.team-row[draggable="true"]');
      rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
          this.draggedTeamId = row.getAttribute('data-team-id');
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragend', () => {
          row.classList.remove('dragging');
          this.draggedTeamId = null;
        });

        row.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          row.classList.add('drag-over');
        });

        row.addEventListener('dragleave', () => {
          row.classList.remove('drag-over');
        });

        row.addEventListener('drop', (e) => {
          e.preventDefault();
          row.classList.remove('drag-over');
          const targetId = row.getAttribute('data-team-id');
          if (this.draggedTeamId && this.draggedTeamId !== targetId) {
            this.reorderTeams(this.draggedTeamId, targetId);
          }
        });
      });
    }
  }

  reorderTeams(fromId, toId) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;

    window.tournamentState.pushUndoSnapshot();
    const fromIndex = group.teams.findIndex(t => t.id === fromId);
    const toIndex = group.teams.findIndex(t => t.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedTeam] = group.teams.splice(fromIndex, 1);
      group.teams.splice(toIndex, 0, movedTeam);
      group.teams.forEach((t, i) => { t.order = i + 1; });
      window.tournamentState.save();
      this.render();
      window.app.showToast('Squad order updated');
    }
  }

  confirmDeleteTeam(teamId) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;
    const team = group.teams.find(t => t.id === teamId);
    if (!team) return;

    window.app.showConfirmDialog(
      'Delete Squad',
      `Are you sure you want to remove <b>${team.name}</b> from ${group.label}?`,
      () => {
        window.tournamentState.pushUndoSnapshot();
        // Move to recycle bin
        window.tournamentState.state.recycleBin.push({
          type: 'team',
          group: group.label,
          data: team,
          timestamp: Date.now()
        });

        group.teams = group.teams.filter(t => t.id !== teamId);
        window.tournamentState.save();
        this.render();
        window.app.showToast(`Deleted ${team.name}`);
      }
    );
  }

  renderFooter() {
    const state = window.tournamentState.state;
    const settings = state.settings;
    const group = window.tournamentState.getActiveGroup();
    const count = (group && group.teams) ? group.teams.length : 0;

    const fldFoot = document.getElementById('fldFooter');
    const fldMeta = document.getElementById('footMeta');

    if (fldFoot) fldFoot.textContent = settings.footerText || 'Powered by WARZONE OFFICIAL';
    if (fldMeta) {
      fldMeta.textContent = `${count} Squads · ${state.autoRanking ? 'Auto-Ranked' : 'Manual Order'}`;
    }
  }
}

// Global instance
window.leaderboard = new LeaderboardComponent();
