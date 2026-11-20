import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { Zap, RotateCcw, Undo2 } from 'lucide-react';

export default function QuickPointUpdate() {
  const { groups, activeGroup, setActiveGroupId, rawTeams, settings, recordMatch, undoLatestMatch, showToast } = useTournament();
  const { isAdmin, setIsLoginModalOpen } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [matchNumber, setMatchNumber] = useState(1);
  const [position, setPosition] = useState('');
  const [posPoints, setPosPoints] = useState('');
  const [kills, setKills] = useState('');
  const [isWin, setIsWin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync default match number based on history
  useEffect(() => {
    if (activeGroup && activeGroup.matches && activeGroup.matches.length > 0) {
      const maxMatch = Math.max(...activeGroup.matches.map(m => m.matchNumber || 1));
      setMatchNumber(maxMatch);
    } else {
      setMatchNumber(1);
    }
  }, [activeGroup]);

  // Handle position select change -> auto calculate Position Points & Win
  const handlePositionChange = (posVal) => {
    setPosition(posVal);
    const posNum = parseInt(posVal);
    if (!posNum || isNaN(posNum)) {
      setPosPoints('');
      setIsWin(false);
      return;
    }

    const placementMap = settings?.placementPoints || {};
    const pts = placementMap[posNum] !== undefined ? placementMap[posNum] : 0;
    setPosPoints(pts);
    setIsWin(posNum === 1);
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!selectedTeamId) {
      showToast('Please select a squad first!', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await recordMatch({
        groupId: activeGroup.id,
        teamId: selectedTeamId,
        matchNumber: parseInt(matchNumber) || 1,
        position: parseInt(position) || 0,
        positionPoints: parseFloat(posPoints) || 0,
        kills: parseInt(kills) || 0,
        isWin: Boolean(isWin)
      });

      // Clear form inputs ready for next squad in same match
      setPosition('');
      setPosPoints('');
      setKills('');
      setIsWin(false);
    } catch (e) {
      // Toast already shown
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedTeamId('');
    setPosition('');
    setPosPoints('');
    setKills('');
    setIsWin(false);
    showToast('Form reset');
  };

  return (
    <div className="bg-[#121216]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      {/* Panel Head */}
      <div className="flex items-center justify-between gap-2 p-4 px-5 border-b border-white/5">
        <h2 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2 leading-none">
          <Zap className="w-5 h-5 text-warzone-gold" />
          <span>Quick Point Update</span>
        </h2>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
          Match Entry
        </span>
      </div>

      {/* Panel Form Body */}
      <div className="p-5 flex flex-col gap-3.5">
        {/* Select Group */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
            Tournament Group
          </label>
          <select
            value={activeGroup ? activeGroup.id : ''}
            onChange={(e) => setActiveGroupId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
          >
            {groups.map(g => (
              <option key={g.id} value={g.id} className="bg-[#141419] text-white">
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Squad */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
            <span>Select Squad</span>
            <span className="text-warzone-gold text-[10.5px] font-medium lowercase">choose team to score</span>
          </div>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
          >
            <option value="" className="bg-[#141419]">-- Select Squad --</option>
            {rawTeams.map(t => (
              <option key={t.id} value={t.id} className="bg-[#141419]">
                {t.name} (Pts: {t.total || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Match # & Position Duo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
              Match #
            </label>
            <input
              type="number"
              min="1"
              value={matchNumber}
              onChange={(e) => setMatchNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
              Position
            </label>
            <select
              value={position}
              onChange={(e) => handlePositionChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
            >
              <option value="" className="bg-[#141419]">-- Finish Pos --</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map(pos => {
                const pts = settings?.placementPoints?.[pos] || 0;
                return (
                  <option key={pos} value={pos} className="bg-[#141419]">
                    {pos === 1 ? '1st (Booyah)' : `${pos}th`} [{pts} PP]
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Pos Pts & Kill Points Duo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
              <span>Pos Pts</span>
              <span className="text-warzone-gold text-[10px]">auto-filled</span>
            </div>
            <input
              type="number"
              value={posPoints}
              onChange={(e) => setPosPoints(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-warzone-gold text-sm outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11.5px] font-bold text-gray-400 tracking-wider uppercase">
              <span>Kill Points</span>
              <span className="text-warzone-red text-[10px]">1 pt / kill</span>
            </div>
            <input
              type="number"
              min="0"
              value={kills}
              onChange={(e) => setKills(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-warzone-red text-sm outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        {/* Win / Booyah Checkbox */}
        <label className="flex items-center gap-2.5 p-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer select-none text-xs font-semibold hover:bg-white/[0.06]">
          <input
            type="checkbox"
            checked={isWin}
            onChange={(e) => setIsWin(e.target.checked)}
            className="w-4 h-4 accent-warzone-red cursor-pointer"
          />
          <span>🏆 Winner / Booyah (WWCD)</span>
        </label>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn btn-red-glow py-3 rounded-xl font-heading text-2xl font-bold tracking-wider text-white uppercase flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            <span>{isSaving ? 'SAVING...' : 'SAVE MATCH RESULT'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <button
              onClick={undoLatestMatch}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10"
              title="Undo latest recorded match"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Undo Last</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
