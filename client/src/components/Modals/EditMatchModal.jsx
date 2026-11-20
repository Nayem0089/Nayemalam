import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Edit3, X } from 'lucide-react';

export default function EditMatchModal() {
  const { editingMatch, setEditingMatch, editMatch } = useTournament();

  const [matchNumber, setMatchNumber] = useState(1);
  const [position, setPosition] = useState(0);
  const [posPoints, setPosPoints] = useState(0);
  const [kills, setKills] = useState(0);
  const [isWin, setIsWin] = useState(false);

  useEffect(() => {
    if (editingMatch) {
      setMatchNumber(editingMatch.matchNumber || 1);
      setPosition(editingMatch.position || 0);
      setPosPoints(editingMatch.positionPoints || 0);
      setKills(editingMatch.kills || 0);
      setIsWin(editingMatch.isWin || editingMatch.position === 1);
    }
  }, [editingMatch]);

  if (!editingMatch) return null;

  const handleSave = () => {
    editMatch(editingMatch.id, {
      matchNumber: parseInt(matchNumber) || 1,
      position: parseInt(position) || 0,
      positionPoints: parseFloat(posPoints) || 0,
      kills: parseInt(kills) || 0,
      isWin: Boolean(isWin)
    });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10">
          <h3 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-warzone-gold" />
            <span>Edit Match Result</span>
          </h3>
          <button onClick={() => setEditingMatch(null)} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div className="text-sm font-bold text-warzone-gold">
            {editingMatch.teamName}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Match #</label>
              <input
                type="number"
                min="1"
                value={matchNumber}
                onChange={(e) => setMatchNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Position</label>
              <input
                type="number"
                min="1"
                max="16"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Pos Points</label>
              <input
                type="number"
                value={posPoints}
                onChange={(e) => setPosPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-warzone-gold text-sm outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Kills</label>
              <input
                type="number"
                min="0"
                value={kills}
                onChange={(e) => setKills(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-warzone-red text-sm outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={isWin}
              onChange={(e) => setIsWin(e.target.checked)}
              className="accent-warzone-red"
            />
            <span>🏆 Count as Win / Booyah</span>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={() => setEditingMatch(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-red-glow px-5 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
