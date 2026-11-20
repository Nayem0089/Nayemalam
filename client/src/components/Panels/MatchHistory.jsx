import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { History, Undo2, Trash2, Edit2, X } from 'lucide-react';

export default function MatchHistory() {
  const { activeGroup, undoLatestMatch, deleteMatch, setEditingMatch, clearGroupHistory, showConfirm } = useTournament();
  const { isAdmin } = useAuth();

  const [teamFilter, setTeamFilter] = useState('');
  const [matchFilter, setMatchFilter] = useState('');

  const matches = (activeGroup && activeGroup.matches) ? activeGroup.matches : [];

  // Filter matches
  let filtered = [...matches];
  if (teamFilter) {
    filtered = filtered.filter(m => m.teamId === teamFilter);
  }
  if (matchFilter) {
    filtered = filtered.filter(m => String(m.matchNumber) === matchFilter);
  }

  const distinctMatches = [...new Set(matches.map(m => m.matchNumber))].sort((a, b) => a - b);

  const handleClear = () => {
    showConfirm(
      'Clear Match History',
      `Clear all ${matches.length} match records for <b>${activeGroup?.name}</b>?<br><br><span style="color:#ffd34d;">Squad leaderboard totals will remain intact.</span>`,
      () => clearGroupHistory(activeGroup.id)
    );
  };

  const handleDeleteRecord = (match) => {
    showConfirm(
      'Delete Match Result',
      `Delete Match ${match.matchNumber} result for <b>${match.teamName}</b>?<br><br>This will rollback <b>${match.totalPoints} points</b> from the squad's total score.`,
      () => deleteMatch(match.id)
    );
  };

  return (
    <div className="bg-[#121216]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {/* Head */}
      <div className="flex items-center justify-between gap-2 p-4 px-5 border-b border-white/5">
        <h2 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2 leading-none">
          <History className="w-5 h-5 text-warzone-gold" />
          <span>Match History</span>
        </h2>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
          {matches.length} records
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
          >
            <option value="" className="bg-[#141419]">All Squads</option>
            {activeGroup?.teams?.map(t => (
              <option key={t.id} value={t.id} className="bg-[#141419]">{t.name}</option>
            ))}
          </select>

          <select
            value={matchFilter}
            onChange={(e) => setMatchFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
          >
            <option value="" className="bg-[#141419]">All Matches</option>
            {distinctMatches.map(m => (
              <option key={m} value={String(m)} className="bg-[#141419]">Match {m}</option>
            ))}
          </select>
        </div>

        {/* Action Toolbar */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={undoLatestMatch}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Undo Latest</span>
            </button>

            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Scrollable Records Feed */}
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {!filtered.length ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              No match records found for this filter.
            </div>
          ) : (
            filtered.map(record => {
              const isBooyah = record.position === 1 || record.isWin;
              const posLabel = record.position === 1 ? '1st 🏆' : (record.position ? `${record.position}th` : '-');
              const timeStr = new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={record.id}
                  className={`p-2.5 px-3 rounded-xl border border-white/10 flex flex-col gap-1.5 transition-all ${
                    isBooyah
                      ? 'bg-gradient-to-r from-yellow-500/10 via-white/[0.03] to-white/[0.02] border-yellow-500/30'
                      : 'bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-sm font-bold px-2 py-0.5 rounded-full bg-warzone-red text-white leading-none">
                      MATCH {record.matchNumber}
                    </span>
                    <span className="font-bold text-xs text-white truncate flex-1">
                      {record.teamName}
                    </span>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isBooyah ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-gray-400'
                    }`}>
                      {posLabel}
                    </span>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingMatch(record)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-yellow-400 hover:text-black text-gray-400 flex items-center justify-center text-xs"
                          title="Edit match record"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record)}
                          className="w-5 h-5 rounded bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 flex items-center justify-center text-xs"
                          title="Delete record and rollback"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="text-warzone-gold">+{record.positionPoints || 0} PP</span>
                      <span className="text-gray-600">+</span>
                      <span className="text-warzone-red">{record.kills || 0} Kills ({record.killPoints || 0} KP)</span>
                      <span className="text-gray-600">=</span>
                      <span className="text-white font-bold">+{record.totalPoints || 0} PTS</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{timeStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
