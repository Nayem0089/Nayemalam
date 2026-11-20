import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function GroupTabs() {
  const { groups, activeGroupId, setActiveGroupId, setIsAddGroupOpen } = useTournament();
  const { isAdmin } = useAuth();

  if (!groups || !groups.length) return null;

  return (
    <nav className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
      {groups.map(group => {
        const isActive = group.id === activeGroupId;
        const count = group.teams ? group.teams.length : 0;

        return (
          <button
            key={group.id}
            onClick={() => setActiveGroupId(group.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-heading text-lg font-semibold tracking-wider transition-all whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-red-500/25 to-yellow-500/15 border-red-500 text-yellow-300 shadow-md shadow-red-500/40'
                : 'bg-[#121216]/90 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{group.name}</span>
            <span className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded-full ${
              isActive ? 'bg-warzone-red text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {count}
            </span>
          </button>
        );
      })}

      {isAdmin && (
        <button
          onClick={() => setIsAddGroupOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-yellow-500/40 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-400/10 font-heading text-lg font-semibold tracking-wider whitespace-nowrap transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Group</span>
        </button>
      )}
    </nav>
  );
}
