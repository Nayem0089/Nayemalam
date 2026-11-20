import React from 'react';
import TeamRow from './TeamRow';

export default function LeaderboardTable({ teams = [] }) {
  if (!teams.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-4xl mb-3 opacity-60">🛡️</div>
        <div className="font-heading text-2xl text-white">No Squads in this Group</div>
        <div className="text-sm text-gray-500">Standings will appear as squads are added and matches are scored.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Column Headers Row */}
      <div className="flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold tracking-[0.12em] text-[#85848f] uppercase select-none">
        <div className="w-12 flex-none text-center">#</div>
        <div className="flex-1 min-w-0 pl-3">TEAM NAME</div>
        <div className="w-14 flex-none text-center">M.P</div>
        <div className="w-14 flex-none text-center">WIN</div>
        <div className="w-16 flex-none text-center">POS PTS</div>
        <div className="w-16 flex-none text-center">KILL PTS</div>
        <div className="w-20 flex-none text-center">TOTAL</div>
      </div>

      {/* Squad Rows List */}
      <div className="flex flex-col gap-2">
        {teams.map((team, index) => {
          const rank = index + 1;
          return (
            <TeamRow
              key={team.id}
              team={team}
              rank={rank}
              isTop1={rank === 1}
              isTop2={rank === 2}
              isTop3={rank === 3}
            />
          );
        })}
      </div>
    </div>
  );
}
