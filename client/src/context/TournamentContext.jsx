/**
 * TOURNAMENT DATA CONTEXT (Full Reactive State & API Synchronization)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';
import { playSound } from '../utils/audioUtils';

const TournamentContext = createContext(null);

export function TournamentProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRanking, setAutoRanking] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Settings Drawer & Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  // Toast Notification System
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  // Confirmation Dialog System
  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  }, []);

  // Fetch full tournament state from backend
  const fetchTournamentData = useCallback(async () => {
    try {
      const res = await apiRequest('/tournament');
      if (res && res.success && res.data) {
        setData(res.data);
        if (res.data.groups && res.data.groups.length > 0) {
          setActiveGroupId(prev => {
            if (prev && res.data.groups.some(g => g.id === prev)) return prev;
            return res.data.groups[0].id;
          });
        }
        if (res.data.settings && res.data.settings.autoRanking !== undefined) {
          setAutoRanking(res.data.settings.autoRanking);
        }
      }
    } catch (err) {
      console.error('Failed to load tournament data:', err);
      showToast('Could not reach tournament server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTournamentData();
  }, [fetchTournamentData]);

  // Active Group Helper
  const activeGroup = (data && data.groups)
    ? data.groups.find(g => g.id === activeGroupId) || data.groups[0] || null
    : null;

  // Filtered & Sorted Squads in active group
  const teams = activeGroup ? activeGroup.teams || [] : [];
  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // --- ACTIONS ---

  // 1. Record Match Result (Quick Point Update)
  const recordMatch = async ({ groupId, teamId, matchNumber, position, positionPoints, kills, isWin, notes }) => {
    try {
      const res = await apiRequest('/matches', {
        method: 'POST',
        body: JSON.stringify({
          groupId: groupId || activeGroup.id,
          teamId,
          matchNumber,
          position,
          positionPoints,
          kills,
          isWin,
          notes
        })
      });

      if (res && res.success && res.data) {
        setData(res.data);
        playSound('success');
        showToast(res.message || 'Match result saved!');
        return res;
      }
    } catch (err) {
      showToast(err.message, 'warning');
      throw err;
    }
  };

  // 2. Edit Historical Match
  const editMatch = async (matchId, updateData) => {
    try {
      const res = await apiRequest(`/matches/${matchId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      if (res && res.success && res.data) {
        setData(res.data);
        setEditingMatch(null);
        showToast(res.message || 'Match updated successfully');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 3. Delete Historical Match (Rolls back points)
  const deleteMatch = async (matchId) => {
    try {
      const res = await apiRequest(`/matches/${matchId}`, {
        method: 'DELETE'
      });
      if (res && res.success && res.data) {
        setData(res.data);
        playSound('undo');
        showToast('Match deleted and squad points rolled back');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 4. Undo Latest Match
  const undoLatestMatch = async () => {
    if (!activeGroup || !activeGroup.matches || !activeGroup.matches.length) {
      showToast('No match records to undo', 'warning');
      return;
    }
    const latest = activeGroup.matches[0];
    await deleteMatch(latest.id);
  };

  // 5. Clear Group History
  const clearGroupHistory = async (groupId) => {
    try {
      const res = await apiRequest(`/matches/clear-group/${groupId || activeGroup.id}`, {
        method: 'POST'
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast('Match history cleared');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 6. Direct Squad Update (Inline editing / roster editor)
  const updateTeam = async (teamId, teamData) => {
    try {
      const res = await apiRequest(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(teamData)
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast(res.message || 'Squad updated');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 7. Add Squad Slot
  const addTeam = async (groupId, name) => {
    try {
      const res = await apiRequest('/teams', {
        method: 'POST',
        body: JSON.stringify({ groupId: groupId || activeGroup.id, name })
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast(res.message || 'Added squad slot');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 8. Delete Squad
  const deleteTeam = async (teamId) => {
    try {
      const res = await apiRequest(`/teams/${teamId}`, {
        method: 'DELETE'
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast(res.message || 'Squad deleted');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 9. Reorder Squads
  const reorderTeams = async (orderedTeamIds) => {
    try {
      const res = await apiRequest('/teams/batch/reorder', {
        method: 'PUT',
        body: JSON.stringify({ orderedTeamIds })
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast('Roster ordering saved');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 10. Group CRUD
  const createGroup = async (name, copyRoster) => {
    try {
      const res = await apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify({
          name,
          copyRosterFromGroupId: copyRoster && activeGroup ? activeGroup.id : null
        })
      });
      if (res && res.success && res.data) {
        setData(res.data);
        if (res.group) setActiveGroupId(res.group.id);
        setIsAddGroupOpen(false);
        showToast(`Created ${name}`);
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  const renameGroup = async (groupId, name) => {
    try {
      const res = await apiRequest(`/groups/${groupId}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast(`Renamed group to ${name}`);
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      const res = await apiRequest(`/groups/${groupId}`, {
        method: 'DELETE'
      });
      if (res && res.success && res.data) {
        setData(res.data);
        if (res.data.groups.length > 0) {
          setActiveGroupId(res.data.groups[0].id);
        }
        showToast('Group deleted');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  const duplicateGroup = async (groupId) => {
    try {
      const res = await apiRequest(`/groups/${groupId}/duplicate`, {
        method: 'POST'
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast('Group duplicated successfully');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 11. Tournament Settings Updates
  const updateSettings = async (settingsUpdates) => {
    try {
      const res = await apiRequest('/tournament/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsUpdates)
      });
      if (res && res.success && res.settings) {
        setData(prev => ({ ...prev, settings: res.settings }));
        if (settingsUpdates.autoRanking !== undefined) {
          setAutoRanking(settingsUpdates.autoRanking);
        }
        showToast('Settings saved successfully');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 12. Backup Restore
  const restoreBackup = async (jsonData) => {
    try {
      const res = await apiRequest('/tournament/restore', {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast('Backup restored successfully!');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 13. Reset Group Points
  const resetGroupPoints = async (groupId) => {
    try {
      const res = await apiRequest('/tournament/reset-group-points', {
        method: 'POST',
        body: JSON.stringify({ groupId: groupId || activeGroup.id })
      });
      if (res && res.success && res.data) {
        setData(res.data);
        showToast('Group scores reset to zero');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  };

  // 14. Permanent Logo Upload
  const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiRequest('/upload', {
      method: 'POST',
      body: formData
    });

    if (res && res.success && res.url) {
      return res.url;
    }
    throw new Error((res && res.error) || 'Upload failed');
  };

  return (
    <TournamentContext.Provider value={{
      data,
      loading,
      settings: data ? data.settings : null,
      groups: data ? data.groups : [],
      activeGroup,
      activeGroupId,
      setActiveGroupId,
      teams: filteredTeams,
      rawTeams: teams,
      searchQuery,
      setSearchQuery,
      autoRanking,
      setAutoRanking,
      isLightMode,
      setIsLightMode,
      toasts,
      showToast,
      confirmDialog,
      showConfirm,
      // Modals
      isSettingsOpen,
      setIsSettingsOpen,
      isShareOpen,
      setIsShareOpen,
      isAddGroupOpen,
      setIsAddGroupOpen,
      editingMatch,
      setEditingMatch,
      // Actions
      recordMatch,
      editMatch,
      deleteMatch,
      undoLatestMatch,
      clearGroupHistory,
      updateTeam,
      addTeam,
      deleteTeam,
      reorderTeams,
      createGroup,
      renameGroup,
      deleteGroup,
      duplicateGroup,
      updateSettings,
      restoreBackup,
      resetGroupPoints,
      uploadLogo,
      fetchTournamentData
    }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}
