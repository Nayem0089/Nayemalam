import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import LeaderboardHeader from './LeaderboardHeader';
import LeaderboardTable from './LeaderboardTable';
import LeaderboardFooter from './LeaderboardFooter';
import { Search } from 'lucide-react';

export default function LeaderboardCard() {
  const { teams, rawTeams, searchQuery, setSearchQuery, autoRanking, setAutoRanking } = useTournament();

  return (
    <div className="flex flex-col gap-3">
      {/* Search & Auto-Ranking Toolbar */}
      <div className="flex items-center justify-between gap-3 p-2 px-3 bg-[#121216]/90 border border-white/10 rounded-xl flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search squads in this group..."
            spellCheck="false"
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-yellow-400 focus:bg-white/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRanking}
              onChange={(e) => setAutoRanking(e.target.checked)}
              className="accent-warzone-red cursor-pointer"
            />
            <span>Auto-Ranking</span>
          </label>
        </div>
      </div>

      {/* Official Standings Card (Capture Area for PNG export) */}
      <div
        id="captureArea"
        className="relative bg-[#0d0d10] bg-[radial-gradient(600px_350px_at_10%_10%,rgba(255,52,52,0.15),transparent_60%),radial-gradient(600px_350px_at_90%_10%,rgba(255,211,77,0.10),transparent_60%),linear-gradient(180deg,#121216_0%,#09090b_100%)] border border-white/10 rounded-[20px] p-7 pt-8 shadow-2xl overflow-hidden"
      >
        <LeaderboardHeader />
        <LeaderboardTable teams={teams} />
        <LeaderboardFooter squadCount={rawTeams.length} />
      </div>
    </div>
  );
}
