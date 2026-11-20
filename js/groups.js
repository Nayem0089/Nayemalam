/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Group Management Engine
 */

class GroupsManager {
  constructor() {
    this.container = null;
  }

  init() {
    this.container = document.getElementById('groupSwitch');
    this.render();

    window.tournamentState.subscribe((event) => {
      this.render();
    });
  }

  render() {
    if (!this.container) return;

    const state = window.tournamentState.state;
    const activeGroup = state.activeGroup;
    const groupOrder = state.groupOrder || ['GROUP A'];
    const isAdmin = window.adminManager ? window.adminManager.isAdmin : false;

    let tabsHtml = groupOrder.map(label => {
      const isActive = label === activeGroup;
      const squadCount = (state.groups[label] && state.groups[label].teams) ? state.groups[label].teams.length : 0;
      return `
        <button class="group-tab-btn ${isActive ? 'active' : ''}" onclick="window.groupsManager.switchGroup('${label}')">
          <span class="group-tab-label">${label}</span>
          <span class="group-tab-count">${squadCount}</span>
        </button>
      `;
    }).join('');

    if (isAdmin) {
      tabsHtml += `
        <button class="group-tab-btn add-group-btn" onclick="window.groupsManager.openAddGroupModal()" title="Create New Group">
          + Add Group
        </button>
      `;
    }

    this.container.innerHTML = tabsHtml;

    // Update group name in leaderboard pill
    const pill = document.getElementById('groupPillDisplay');
    if (pill) pill.textContent = activeGroup;
  }

  switchGroup(groupName) {
    const state = window.tournamentState.state;
    if (!state.groups[groupName]) return;

    state.activeGroup = groupName;
    window.tournamentState.save();
    window.app.showToast(`Switched to ${groupName}`);
  }

  openAddGroupModal() {
    window.app.openModal('addGroupModal');
    const input = document.getElementById('newGroupNameInput');
    if (input) {
      const nextLetter = String.fromCharCode(65 + (window.tournamentState.state.groupOrder.length || 0));
      input.value = `GROUP ${nextLetter}`;
      input.focus();
    }
  }

  createGroup(name, copyRosterFromCurrent = false) {
    const state = window.tournamentState.state;
    const cleanName = (name || '').trim().toUpperCase();

    if (!cleanName) {
      window.app.showToast('Please enter a valid group name', 'warning');
      return false;
    }

    if (state.groups[cleanName]) {
      window.app.showToast(`Group "${cleanName}" already exists!`, 'warning');
      return false;
    }

    window.tournamentState.pushUndoSnapshot();

    let teams = [];
    if (copyRosterFromCurrent) {
      const currentGroup = state.groups[state.activeGroup];
      if (currentGroup && currentGroup.teams) {
        // Clone squads with 0 points
        teams = currentGroup.teams.map((t, i) => ({
          id: 'tm_' + Math.random().toString(36).substr(2, 7),
          name: t.name,
          logo: t.logo || '',
          matches: 0,
          wins: 0,
          positionPoints: 0,
          killPoints: 0,
          total: 0,
          order: i + 1
        }));
      }
    } else {
      teams = generateEmptyTeams(12);
    }

    state.groups[cleanName] = {
      id: 'grp_' + Date.now(),
      label: cleanName,
      teams: teams,
      history: []
    };

    state.groupOrder.push(cleanName);
    state.activeGroup = cleanName;

    window.tournamentState.save();
    window.app.closeModal('addGroupModal');
    window.app.showToast(`Created ${cleanName}`);
    return true;
  }

  renameActiveGroup(newName) {
    const state = window.tournamentState.state;
    const oldName = state.activeGroup;
    const cleanName = (newName || '').trim().toUpperCase();

    if (!cleanName || cleanName === oldName) return;

    if (state.groups[cleanName]) {
      window.app.showToast(`Group "${cleanName}" already exists!`, 'warning');
      return;
    }

    window.tournamentState.pushUndoSnapshot();

    const groupData = state.groups[oldName];
    groupData.label = cleanName;

    delete state.groups[oldName];
    state.groups[cleanName] = groupData;

    const idx = state.groupOrder.indexOf(oldName);
    if (idx !== -1) {
      state.groupOrder[idx] = cleanName;
    }

    state.activeGroup = cleanName;
    window.tournamentState.save();
    window.app.showToast(`Renamed group to ${cleanName}`);
  }

  duplicateActiveGroup() {
    const state = window.tournamentState.state;
    const current = state.groups[state.activeGroup];
    if (!current) return;

    const newName = `${state.activeGroup} (COPY)`;
    this.createGroup(newName, true);
  }

  confirmDeleteActiveGroup() {
    const state = window.tournamentState.state;
    if (state.groupOrder.length <= 1) {
      window.app.showToast('Cannot delete the only remaining group!', 'warning');
      return;
    }

    const currentName = state.activeGroup;
    window.app.showConfirmDialog(
      'Delete Group',
      `Are you sure you want to delete <b>${currentName}</b> and all its squads and match history?`,
      () => {
        window.tournamentState.pushUndoSnapshot();

        delete state.groups[currentName];
        state.groupOrder = state.groupOrder.filter(g => g !== currentName);
        state.activeGroup = state.groupOrder[0];

        window.tournamentState.save();
        window.app.showToast(`Deleted ${currentName}`);
      }
    );
  }

  moveActiveGroup(direction) {
    const state = window.tournamentState.state;
    const order = state.groupOrder;
    const idx = order.indexOf(state.activeGroup);

    if (idx === -1) return;

    if (direction === 'left' && idx > 0) {
      const temp = order[idx - 1];
      order[idx - 1] = order[idx];
      order[idx] = temp;
      window.tournamentState.save();
    } else if (direction === 'right' && idx < order.length - 1) {
      const temp = order[idx + 1];
      order[idx + 1] = order[idx];
      order[idx] = temp;
      window.tournamentState.save();
    }
  }
}

// Global instance
window.groupsManager = new GroupsManager();
