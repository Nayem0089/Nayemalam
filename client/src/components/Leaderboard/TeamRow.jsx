import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';
import { Zap, X } from 'lucide-react';

export default function TeamRow({ team, rank, isTop1, isTop2, isTop3 }) {
  const { isAdmin } = useAuth();
  const { updateTeam, deleteTeam, showConfirm } = useTournament();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(team.name);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameVal.trim() && nameVal.trim() !== team.name) {
      updateTeam(team.id, { name: nameVal.trim() });
    }
  };

  const handleStatChange = (field, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    updateTeam(team.id, { [field]: num });
  };

  const handleDelete = () => {
    showConfirm(
      'Delete Squad',
      `Are you sure you want to delete <b>${team.name}</b> from this tournament group?`,
      () => deleteTeam(team.id)
    );
  };

  // Trophy or Medal Icon
  let trophyIcon = null;
  if (isTop1) {
    trophyIcon = <span className="text-lg flex-none" title="1st Place - Leader">🏆</span>;
  } else if (isTop2) {
    trophyIcon = <span className="text-lg flex-none" title="2nd Place">🥈</span>;
  } else if (isTop3) {
    trophyIcon = <span className="text-lg flex-none" title="3rd Place">🥉</span>;
  }

  return (
    <div
      className={`flex items-center gap-2.5 p-1 px-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all relative ${
        isTop1 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
      }`}
      data-team-id={team.id}
    >
      {/* 1. Rank Box (Solid Red Block on the left) */}
      <div className="w-12 h-11 flex-none rounded-md bg-gradient-to-br from-[#FF3434] to-[#b81c1c] flex items-center justify-center shadow-md shadow-red-500/40">
        <span className="font-heading text-2xl font-bold text-white leading-none">
          {rank}
        </span>
      </div>

      {/* 2. Team Name Container */}
      <div
        className={`flex-1 min-w-0 h-11 bg-[#141418] border border-white/5 rounded-md flex items-center px-3.5 gap-2.5 ${
          isTop1
            ? 'border-2 border-warzone-gold shadow-[0_0_16px_rgba(255,211,77,0.35)] bg-gradient-to-r from-yellow-500/10 to-[#141418]'
            : ''
        }`}
      >
        {trophyIcon}

        {team.logo && (
          <img
            src={team.logo}
            alt={team.name}
            className="w-6 h-6 object-contain rounded flex-none"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {isAdmin && isEditingName ? (
          <input
            type="text"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNameBlur(); }}
            autoFocus
            className="flex-1 bg-white/10 text-white font-bold text-sm uppercase px-2 py-0.5 rounded outline-none border border-yellow-400"
          />
        ) : (
          <span
            onClick={() => { if (isAdmin) setIsEditingName(true); }}
            className={`font-sans font-extrabold text-[13.5px] tracking-wide uppercase text-white truncate flex-1 ${
              isAdmin ? 'cursor-pointer hover:text-yellow-300' : ''
            }`}
            title={isAdmin ? 'Click to edit squad name' : team.name}
          >
            {team.name}
          </span>
        )}
      </div>

      {/* 3. Matches Played (M.P) */}
      <div className="w-14 flex-none text-center">
        {isAdmin ? (
          <input
            type="number"
            min="0"
            value={team.matches || 0}
            onChange={(e) => handleStatChange('matches', e.target.value)}
            className="w-12 h-8 text-center font-heading text-xl font-semibold bg-white/10 border border-white/15 rounded text-white outline-none focus:border-yellow-400"
          />
        ) : (
          <span className="font-heading text-2xl font-semibold text-white leading-none">
            {team.matches || 0}
          </span>
        )}
      </div>

      {/* 4. Wins */}
      <div className="w-14 flex-none text-center">
        {isAdmin ? (
          <input
            type="number"
            min="0"
            value={team.wins || 0}
            onChange={(e) => handleStatChange('wins', e.target.value)}
            className="w-12 h-8 text-center font-heading text-xl font-semibold bg-white/10 border border-white/15 rounded text-white outline-none focus:border-yellow-400"
          />
        ) : (
          <span className="font-heading text-2xl font-semibold text-white leading-none">
            {team.wins || 0}
          </span>
        )}
      </div>

      {/* 5. Position Points (POS PTS - Gold) */}
      <div className="w-16 flex-none text-center">
        {isAdmin ? (
          <input
            type="number"
            min="0"
            value={team.positionPoints || 0}
            onChange={(e) => handleStatChange('positionPoints', e.target.value)}
            className="w-14 h-8 text-center font-heading text-xl font-semibold bg-white/10 border border-white/15 rounded text-warzone-gold outline-none focus:border-yellow-400"
          />
        ) : (
          <span className="font-heading text-2xl font-semibold text-warzone-gold leading-none">
            {team.positionPoints || 0}
          </span>
        )}
      </div>

      {/* 6. Kill Points (KILL PTS - Red) */}
      <div className="w-16 flex-none text-center">
        {isAdmin ? (
          <input
            type="number"
            min="0"
            value={team.killPoints || 0}
            onChange={(e) => handleStatChange('killPoints', e.target.value)}
            className="w-14 h-8 text-center font-heading text-xl font-semibold bg-white/10 border border-white/15 rounded text-warzone-red outline-none focus:border-yellow-400"
          />
        ) : (
          <span className="font-heading text-2xl font-semibold text-warzone-red leading-none">
            {team.killPoints || 0}
          </span>
        )}
      </div>

      {/* 7. Total Points (Stadium Rounded Pill Badge) */}
      <div className="w-20 flex-none flex justify-center">
        <div
          className={`flex items-center justify-center min-w-[70px] h-9 px-3.5 rounded-full shadow-lg ${
            isTop1
              ? 'bg-gradient-to-br from-[#FFE58A] to-[#FFD34D] text-[#120e03] shadow-[0_0_18px_rgba(255,211,77,0.55)] font-bold'
              : 'bg-gradient-to-br from-[#FF4545] to-[#d82323] text-white shadow-[0_0_14px_rgba(255,52,52,0.45)]'
          }`}
        >
          <span className="font-heading text-2xl font-bold leading-none">
            {team.total || 0}
          </span>
        </div>
      </div>

      {/* Admin Row Quick Actions */}
      {isAdmin && (
        <div className="flex items-center gap-1 pl-1 row-admin-controls">
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 flex items-center justify-center text-xs transition-colors"
            title="Delete Squad"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
