/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Settings & Visual Customization Controller
 */

class SettingsManager {
  constructor() {
    this.activeTab = 'tournament';
    this.drawer = null;
  }

  init() {
    this.drawer = document.getElementById('settingsDrawer');
    this.bindEvents();
    this.applyCurrentTheme();
  }

  bindEvents() {
    // Open Settings Drawer
    const openBtn = document.getElementById('openSettingsBtn');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.open();
      });
    }

    // Close Settings Drawer
    const closeBtn = document.getElementById('closeSettingsBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Tab buttons inside settings drawer
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.openTab(tab);
      });
    });

    // Tournament Branding Inputs
    this.bindBrandingInputs();

    // Scoring Inputs
    this.bindScoringInputs();

    // Theme & Visual Customizer
    this.bindThemeInputs();

    // Security Inputs
    this.bindSecurityInputs();

    // Data Management Buttons
    this.bindDataInputs();
  }

  open() {
    if (!window.adminManager.isAdmin) {
      window.adminManager.openPasswordModal();
      return;
    }

    this.syncFormValues();
    this.renderSquadRosterList();
    this.renderGroupsSettingsList();
    if (this.drawer) this.drawer.classList.add('open');
    const overlay = document.getElementById('drawerOverlay');
    if (overlay) overlay.classList.add('visible');
  }

  close() {
    if (this.drawer) this.drawer.classList.remove('open');
    const overlay = document.getElementById('drawerOverlay');
    if (overlay) overlay.classList.remove('visible');
  }

  openTab(tabName) {
    this.activeTab = tabName;

    // Update active tab button
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update active panel
    document.querySelectorAll('.settings-panel').forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === tabName);
    });

    if (tabName === 'squads') {
      this.renderSquadRosterList();
    } else if (tabName === 'groups') {
      this.renderGroupsSettingsList();
    }
  }

  syncFormValues() {
    const state = window.tournamentState.state;
    const s = state.settings;

    // Branding
    this.setVal('setOrgName', s.websiteName);
    this.setVal('setTournName', s.tournamentName);
    this.setVal('setSubtitle', s.tournamentSubtitle);
    this.setVal('setMatchInfo', s.matchInfoLine);
    this.setVal('setFooterText', s.footerText);

    // Scoring
    const scoring = state.scoring;
    this.setVal('setKillWeight', scoring.killWeight);
    for (let pos = 1; pos <= 16; pos++) {
      const el = document.getElementById(`setPosPts_${pos}`);
      if (el) el.value = scoring.placementPoints[pos] !== undefined ? scoring.placementPoints[pos] : 0;
    }

    // Theme inputs
    const theme = DEFAULT_CONFIG.themes[state.currentTheme] || DEFAULT_CONFIG.themes.redEsports;
    const colors = state.customTheme ? state.customTheme.colors : theme.colors;

    this.setVal('themePrimaryColor', colors.primary);
    this.setVal('themeSecondaryColor', colors.secondary);
    this.setVal('themeBgColor', colors.background);
    this.setVal('themeCardBg', colors.cardBg);

    // Active theme preset button
    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-theme') === state.currentTheme);
    });
  }

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  }

  bindBrandingInputs() {
    const bindLive = (id, stateProp) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          window.tournamentState.state.settings[stateProp] = e.target.value;
          window.tournamentState.save();
          if (window.leaderboard) window.leaderboard.render();
        });
      }
    };

    bindLive('setOrgName', 'websiteName');
    bindLive('setTournName', 'tournamentName');
    bindLive('setSubtitle', 'tournamentSubtitle');
    bindLive('setMatchInfo', 'matchInfoLine');
    bindLive('setFooterText', 'footerText');

    // Logo File Upload
    const logoFile = document.getElementById('setTournamentLogoFile');
    if (logoFile) {
      logoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          window.tournamentState.state.settings.tournamentLogo = dataUrl;
          window.tournamentState.state.settings.websiteLogo = dataUrl;
          window.tournamentState.save();
          if (window.leaderboard) window.leaderboard.render();
          window.app.showToast('Tournament logo updated');
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset Logo button
    const resetLogoBtn = document.getElementById('resetLogoBtn');
    if (resetLogoBtn) {
      resetLogoBtn.addEventListener('click', () => {
        window.tournamentState.state.settings.tournamentLogo = 'assets/warzone-logo.png';
        window.tournamentState.state.settings.websiteLogo = 'assets/warzone-logo.png';
        window.tournamentState.save();
        if (window.leaderboard) window.leaderboard.render();
        window.app.showToast('Logo restored to default');
      });
    }
  }

  bindScoringInputs() {
    const killWeightInput = document.getElementById('setKillWeight');
    if (killWeightInput) {
      killWeightInput.addEventListener('change', (e) => {
        const weight = Math.max(0, parseFloat(e.target.value) || 1);
        window.tournamentState.state.scoring.killWeight = weight;
        window.tournamentState.recalculateActiveGroup();
        window.app.showToast(`Kill Point Multiplier set to ${weight}x`);
      });
    }

    // 1st to 16th placement inputs
    for (let pos = 1; pos <= 16; pos++) {
      const el = document.getElementById(`setPosPts_${pos}`);
      if (el) {
        el.addEventListener('change', (e) => {
          const pts = Math.max(0, parseFloat(e.target.value) || 0);
          window.tournamentState.state.scoring.placementPoints[pos] = pts;
          window.tournamentState.save();
          window.quickUpdate.populatePositionDropdown();
        });
      }
    }
  }

  bindThemeInputs() {
    // Theme Preset buttons
    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.getAttribute('data-theme');
        this.selectThemePreset(themeId);
      });
    });

    // Custom Color Pickers
    const bindColor = (id, prop) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = e.target.value;
          if (!window.tournamentState.state.customTheme) {
            window.tournamentState.state.customTheme = JSON.parse(JSON.stringify(DEFAULT_CONFIG.themes.custom));
          }
          window.tournamentState.state.customTheme.colors[prop] = val;
          window.tournamentState.state.currentTheme = 'custom';
          this.applyThemeColors(window.tournamentState.state.customTheme.colors);
          window.tournamentState.save();
        });
      }
    };

    bindColor('themePrimaryColor', 'primary');
    bindColor('themeSecondaryColor', 'secondary');
    bindColor('themeBgColor', 'background');
    bindColor('themeCardBg', 'cardBg');
  }

  selectThemePreset(themeId) {
    const preset = DEFAULT_CONFIG.themes[themeId];
    if (!preset) return;

    window.tournamentState.state.currentTheme = themeId;
    window.tournamentState.save();

    document.querySelectorAll('.theme-preset-card').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-theme') === themeId);
    });

    this.applyThemeColors(preset.colors);
    this.syncFormValues();
    window.app.showToast(`Applied theme: ${preset.name}`);
  }

  applyCurrentTheme() {
    const state = window.tournamentState.state;
    if (!state) return;

    const themeId = state.currentTheme || 'redEsports';
    let colors = null;

    if (themeId === 'custom' && state.customTheme) {
      colors = state.customTheme.colors;
    } else {
      const preset = DEFAULT_CONFIG.themes[themeId] || DEFAULT_CONFIG.themes.redEsports;
      colors = preset.colors;
    }

    this.applyThemeColors(colors);
  }

  applyThemeColors(colors) {
    if (!colors) return;
    const root = document.documentElement;

    root.style.setProperty('--red', colors.primary);
    root.style.setProperty('--red-bright', colors.primary);
    root.style.setProperty('--primary-glow', colors.primaryGlow || 'rgba(255, 52, 52, 0.55)');
    root.style.setProperty('--gold', colors.secondary);
    root.style.setProperty('--gold-bright', colors.secondary);
    root.style.setProperty('--secondary-glow', colors.secondaryGlow || 'rgba(255, 211, 77, 0.45)');
    root.style.setProperty('--void', colors.background);
    root.style.setProperty('--panel', colors.cardBg || 'rgba(18, 18, 22, 0.85)');
  }

  bindSecurityInputs() {
    const changePassBtn = document.getElementById('saveNewAdminPassBtn');
    if (changePassBtn) {
      changePassBtn.addEventListener('click', async () => {
        const curPass = document.getElementById('curAdminPassInput').value;
        const newPass = document.getElementById('newAdminPassInput').value;
        const confirmPass = document.getElementById('confirmNewAdminPassInput').value;

        if (newPass !== confirmPass) {
          window.app.showToast('New passwords do not match!', 'warning');
          return;
        }

        const res = await window.adminManager.changePassword(curPass, newPass);
        if (res.success) {
          window.app.showToast(res.message);
          document.getElementById('curAdminPassInput').value = '';
          document.getElementById('newAdminPassInput').value = '';
          document.getElementById('confirmNewAdminPassInput').value = '';
        } else {
          window.app.showToast(res.message, 'warning');
        }
      });
    }

    const lockNowBtn = document.getElementById('lockAdminSessionBtn');
    if (lockNowBtn) {
      lockNowBtn.addEventListener('click', () => {
        this.close();
        window.adminManager.lockAdmin();
      });
    }
  }

  bindDataInputs() {
    // Export JSON
    const exportJsonBtn = document.getElementById('exportJsonDataBtn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => window.exportManager.exportJSON());
    }

    // Import JSON
    const importFileInput = document.getElementById('importJsonFileInput');
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) window.exportManager.importJSON(file);
      });
    }

    // Reset Group Points
    const resetGroupPtsBtn = document.getElementById('resetGroupPointsBtn');
    if (resetGroupPtsBtn) {
      resetGroupPtsBtn.addEventListener('click', () => {
        const grp = window.tournamentState.getActiveGroup();
        window.app.showConfirmDialog(
          'Reset Group Points',
          `Reset all squad scores to 0 for <b>${grp.label}</b>? Match history will also be cleared.`,
          () => {
            window.tournamentState.pushUndoSnapshot();
            grp.teams.forEach(t => {
              t.matches = 0;
              t.wins = 0;
              t.positionPoints = 0;
              t.killPoints = 0;
              t.total = 0;
            });
            grp.history = [];
            window.tournamentState.save();
            window.app.showToast(`Scores reset for ${grp.label}`);
          }
        );
      });
    }

    // Reset All Tournament Data
    const resetAllBtn = document.getElementById('resetAllTournamentBtn');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        window.app.showConfirmDialog(
          'RESET ENTIRE TOURNAMENT',
          `<span style="color:#ff3434;font-weight:bold;">CRITICAL WARNING:</span> This will permanently erase ALL groups, teams, scores, settings and custom data, returning the system to factory default.<br><br>Do you want to proceed?`,
          () => {
            localStorage.removeItem(STORAGE_KEY);
            window.tournamentState.state = window.tournamentState.getDefaultState();
            window.tournamentState.save();
            this.applyCurrentTheme();
            this.syncFormValues();
            this.close();
            window.app.showToast('Tournament reset to factory default');
          }
        );
      });
    }
  }

  renderSquadRosterList() {
    const container = document.getElementById('squadRosterList');
    if (!container) return;

    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.teams) {
      container.innerHTML = '<div class="hint">No squads in this group.</div>';
      return;
    }

    container.innerHTML = group.teams.map((t, idx) => `
      <div class="roster-item" data-team-id="${t.id}">
        <span class="roster-index">#${idx + 1}</span>
        <input type="text" class="roster-name-input" value="${t.name}" data-team-id="${t.id}">
        <label class="roster-logo-btn" title="Upload Squad Logo">
          📷
          <input type="file" accept="image/*" class="roster-logo-upload" data-team-id="${t.id}" style="display:none;">
        </label>
        <button class="roster-delete-btn" onclick="window.settingsManager.deleteSquad('${t.id}')" title="Delete Squad">×</button>
      </div>
    `).join('');

    // Attach name change listeners
    container.querySelectorAll('.roster-name-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const teamId = e.target.getAttribute('data-team-id');
        const team = group.teams.find(tm => tm.id === teamId);
        if (team) {
          team.name = e.target.value.trim() || team.name;
          window.tournamentState.save();
          if (window.leaderboard) window.leaderboard.render();
        }
      });
    });

    // Attach logo upload listeners
    container.querySelectorAll('.roster-logo-upload').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const teamId = e.target.getAttribute('data-team-id');
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
          const team = group.teams.find(tm => tm.id === teamId);
          if (team) {
            team.logo = evt.target.result;
            window.tournamentState.save();
            if (window.leaderboard) window.leaderboard.render();
            window.app.showToast(`Logo uploaded for ${team.name}`);
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  addSquadSlot() {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;

    const nextNo = (group.teams.length || 0) + 1;
    const newTeam = {
      id: 'tm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: `Squad ${String(nextNo).padStart(2, '0')}`,
      logo: '',
      matches: 0,
      wins: 0,
      positionPoints: 0,
      killPoints: 0,
      total: 0,
      order: nextNo
    };

    window.tournamentState.pushUndoSnapshot();
    group.teams.push(newTeam);
    window.tournamentState.save();
    this.renderSquadRosterList();
    if (window.leaderboard) window.leaderboard.render();
    window.app.showToast(`Added ${newTeam.name}`);
  }

  deleteSquad(teamId) {
    const group = window.tournamentState.getActiveGroup();
    if (!group) return;
    const team = group.teams.find(t => t.id === teamId);
    if (!team) return;

    window.app.showConfirmDialog(
      'Delete Squad',
      `Delete <b>${team.name}</b> from ${group.label}?`,
      () => {
        window.tournamentState.pushUndoSnapshot();
        group.teams = group.teams.filter(t => t.id !== teamId);
        window.tournamentState.save();
        this.renderSquadRosterList();
        if (window.leaderboard) window.leaderboard.render();
        window.app.showToast(`Deleted ${team.name}`);
      }
    );
  }

  renderGroupsSettingsList() {
    const container = document.getElementById('groupsSettingsList');
    if (!container) return;

    const state = window.tournamentState.state;
    container.innerHTML = state.groupOrder.map((grpName, idx) => `
      <div class="group-settings-row ${grpName === state.activeGroup ? 'active-group-row' : ''}">
        <span class="group-name-badge">${grpName}</span>
        <div class="group-settings-actions">
          <button class="btn btn-sm" onclick="window.groupsManager.moveActiveGroup('left')" title="Move Left">◀</button>
          <button class="btn btn-sm" onclick="window.groupsManager.moveActiveGroup('right')" title="Move Right">▶</button>
          <button class="btn btn-sm btn-outline-danger" onclick="window.groupsManager.confirmDeleteActiveGroup()" title="Delete">🗑</button>
        </div>
      </div>
    `).join('');
  }
}

// Global instance
window.settingsManager = new SettingsManager();
