import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { exportToJson } from '../../utils/exportUtils';
import {
  Settings,
  X,
  Shield,
  Layers,
  Award,
  Palette,
  KeyRound,
  Database,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Copy
} from 'lucide-react';

export default function SettingsDrawer() {
  const {
    data,
    settings,
    activeGroup,
    rawTeams,
    groups,
    isSettingsOpen,
    setIsSettingsOpen,
    updateSettings,
    uploadLogo,
    addTeam,
    updateTeam,
    deleteTeam,
    renameGroup,
    duplicateGroup,
    deleteGroup,
    restoreBackup,
    resetGroupPoints,
    showConfirm,
    showToast
  } = useTournament();

  const { changePassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('tournament');

  // Form states
  const [websiteName, setWebsiteName] = useState(settings?.websiteName || '');
  const [tournamentName, setTournamentName] = useState(settings?.tournamentName || '');
  const [tournamentSubtitle, setTournamentSubtitle] = useState(settings?.tournamentSubtitle || '');
  const [matchInfoLine, setMatchInfoLine] = useState(settings?.matchInfoLine || '');
  const [footerText, setFooterText] = useState(settings?.footerText || '');
  const [killWeight, setKillWeight] = useState(settings?.killWeight || 1.0);
  const [placementPoints, setPlacementPoints] = useState(settings?.placementPoints || {});

  // Security form
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  if (!isSettingsOpen) return null;

  const handleSaveBranding = async () => {
    await updateSettings({
      websiteName,
      tournamentName,
      tournamentSubtitle,
      matchInfoLine,
      footerText
    });
  };

  const handleSaveScoring = async () => {
    await updateSettings({
      killWeight: parseFloat(killWeight) || 1.0,
      placementPoints
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    try {
      await changePassword(curPass, newPass);
      showToast('Admin password updated successfully');
      setCurPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showToast('Uploading emblem...');
      const url = await uploadLogo(file);
      await updateSettings({ tournamentLogo: url, websiteLogo: url });
      showToast('Logo updated successfully');
    } catch (err) {
      showToast('Failed to upload logo', 'error');
    }
  };

  const handleSquadLogoUpload = async (teamId, file) => {
    if (!file) return;
    try {
      showToast('Uploading squad logo...');
      const url = await uploadLogo(file);
      await updateTeam(teamId, { logo: url });
      showToast('Squad logo updated');
    } catch (err) {
      showToast('Upload failed', 'error');
    }
  };

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        await restoreBackup(parsed);
      } catch (err) {
        showToast('Invalid JSON backup file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsSettingsOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <div className="relative w-full max-w-2xl bg-[#0d0d11] border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 px-6 border-b border-white/10 bg-white/[0.02]">
          <h2 className="font-heading text-3xl font-bold tracking-wide text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-warzone-gold" />
            <span>Tournament Settings</span>
          </h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 p-2 px-6 bg-black/40 border-b border-white/5 overflow-x-auto">
          {[
            { id: 'tournament', label: 'Branding', icon: Award },
            { id: 'squads', label: 'Squad Roster', icon: Shield },
            { id: 'groups', label: 'Groups', icon: Layers },
            { id: 'scoring', label: 'Scoring', icon: Award },
            { id: 'theme', label: 'Theme & Design', icon: Palette },
            { id: 'security', label: 'Security', icon: KeyRound },
            { id: 'data', label: 'Data & Backup', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* TAB 1: BRANDING */}
          {activeTab === 'tournament' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Tournament Branding</h3>
                <p className="text-xs text-gray-400">Configure public titles, logo emblem, and tournament subtitles.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Website / Org Name</label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Tournament Title</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Standings Subtitle</label>
                  <input
                    type="text"
                    value={tournamentSubtitle}
                    onChange={(e) => setTournamentSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Match Info Line</label>
                  <input
                    type="text"
                    value={matchInfoLine}
                    onChange={(e) => setMatchInfoLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Footer Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Tournament Emblem Logo</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={settings?.tournamentLogo || '/assets/warzone-logo.png'}
                      alt="Logo"
                      className="w-12 h-12 object-contain rounded-lg bg-white/5 border border-white/10 p-1"
                    />
                    <label className="btn btn-gold-glow px-4 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveBranding}
                  className="btn btn-red-glow py-2.5 px-5 rounded-xl font-heading text-lg font-bold text-white uppercase mt-2"
                >
                  Save Branding Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SQUAD ROSTER */}
          {activeTab === 'squads' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-warzone-gold">Squad Roster ({activeGroup?.name})</h3>
                  <p className="text-xs text-gray-400">Manage participating teams, edit names, and upload squad badges.</p>
                </div>
                <button
                  onClick={() => addTeam(activeGroup.id)}
                  className="btn btn-red-glow px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Squad</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
                {rawTeams.map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="font-heading text-lg font-bold text-yellow-400 w-7">#{idx + 1}</span>
                    <input
                      type="text"
                      defaultValue={team.name}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== team.name) {
                          updateTeam(team.id, { name: e.target.value.trim() });
                        }
                      }}
                      className="flex-1 bg-transparent border-b border-transparent focus:border-yellow-400 text-white font-bold text-xs uppercase px-1 py-1 outline-none"
                    />

                    <label className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-400/20 text-gray-300 hover:text-yellow-300 cursor-pointer text-xs" title="Upload squad badge">
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSquadLogoUpload(team.id, e.target.files[0])}
                      />
                    </label>

                    <button
                      onClick={() => {
                        showConfirm('Delete Squad', `Remove <b>${team.name}</b> from ${activeGroup?.name}?`, () => deleteTeam(team.id));
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500 hover:text-white text-gray-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GROUPS */}
          {activeTab === 'groups' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Group Stages</h3>
                <p className="text-xs text-gray-400">Organize tournament groups (e.g. Group A, Group B, Semi Finals, Grand Finals).</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {groups.map(grp => (
                  <div key={grp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="font-heading text-xl font-bold text-white">{grp.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => duplicateGroup(grp.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 inline-flex items-center gap-1"
                        title="Duplicate Group"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => {
                          showConfirm('Delete Group', `Delete <b>${grp.name}</b> and all its squads?`, () => deleteGroup(grp.id));
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SCORING MATRIX */}
          {activeTab === 'scoring' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Scoring Rules Configuration</h3>
                <p className="text-xs text-gray-400">Configure Battle Royale placement points and kill multiplier.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase">Kill Point Multiplier</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={killWeight}
                  onChange={(e) => setKillWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                />
              </div>

              <div className="text-xs font-bold text-gray-300 mt-2">Position Points Matrix (1st - 16th)</div>
              <div className="grid grid-cols-4 gap-2.5">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(pos => (
                  <div key={pos} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1 text-center">
                    <span className="text-[10px] font-bold text-warzone-gold">{pos === 1 ? '1st (Booyah)' : `${pos}th Place`}</span>
                    <input
                      type="number"
                      value={placementPoints[pos] !== undefined ? placementPoints[pos] : 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPlacementPoints(prev => ({ ...prev, [pos]: val }));
                      }}
                      className="w-full text-center font-heading text-xl font-bold bg-transparent border-b border-white/20 text-white outline-none focus:border-yellow-400"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveScoring}
                className="btn btn-red-glow py-2.5 px-5 rounded-xl font-heading text-lg font-bold text-white uppercase mt-2"
              >
                Save Scoring Matrix
              </button>
            </div>
          )}

          {/* TAB 5: THEME PRESETS */}
          {activeTab === 'theme' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Esports Visual Themes</h3>
                <p className="text-xs text-gray-400">Choose from gaming tournament color presets.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'redEsports', name: 'Red Esports (Default)', bg: 'from-red-500 to-yellow-500' },
                  { id: 'goldPremium', name: 'Gold Premium', bg: 'from-yellow-400 to-amber-600' },
                  { id: 'blueGaming', name: 'Blue Cyber', bg: 'from-cyan-400 to-blue-600' },
                  { id: 'purpleNeon', name: 'Purple Neon', bg: 'from-purple-500 to-pink-500' }
                ].map(th => (
                  <div
                    key={th.id}
                    onClick={() => updateSettings({ currentTheme: th.id })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 ${
                      settings?.currentTheme === th.id
                        ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div className={`h-8 rounded-lg bg-gradient-to-r ${th.bg}`} />
                    <span className="text-xs font-bold text-white">{th.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Admin Security</h3>
                <p className="text-xs text-gray-400">Change your master administrator credentials.</p>
              </div>

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Current Password</label>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gold-glow py-2.5 px-5 rounded-xl font-bold text-xs uppercase mt-2 text-black"
                >
                  Update Admin Password
                </button>
              </form>

              <hr className="border-white/10 my-2" />

              <div>
                <button
                  onClick={() => {
                    logout();
                    setIsSettingsOpen(false);
                    showToast('Admin session locked');
                  }}
                  className="px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20"
                >
                  Lock Admin Session Now
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: DATA & BACKUP */}
          {activeTab === 'data' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-heading text-xl font-bold text-warzone-gold">Database, Backup & Restore</h3>
                <p className="text-xs text-gray-400">Export tournament backups, restore from JSON, or reset scores.</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold text-white">Full JSON Backup</span>
                  <p className="text-[11px] text-gray-400">Download a complete snapshot of all groups, teams, points, and settings.</p>
                  <button
                    onClick={() => {
                      exportToJson(data, `warzone_backup_${new Date().toISOString().slice(0, 10)}.json`);
                      showToast('Tournament backup downloaded');
                    }}
                    className="self-start btn btn-gold-glow px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Export JSON Backup
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold text-white">Restore from Backup</span>
                  <p className="text-[11px] text-gray-400">Upload a previously exported JSON backup file.</p>
                  <label className="self-start btn btn-gold-glow px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
                    Choose Backup File
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>

                <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col gap-2">
                  <span className="text-xs font-bold text-red-400">Danger Zone</span>
                  <p className="text-[11px] text-gray-400">Reset all team scores for the active group to zero.</p>
                  <button
                    onClick={() => {
                      showConfirm('Reset Group Scores', `Reset all points to 0 for <b>${activeGroup?.name}</b>?`, () => resetGroupPoints(activeGroup.id));
                    }}
                    className="self-start px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20"
                  >
                    Reset Active Group Scores
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
