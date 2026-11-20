import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { PlusCircle, X } from 'lucide-react';

export default function AddGroupModal() {
  const { isAddGroupOpen, setIsAddGroupOpen, createGroup, groups } = useTournament();
  const [name, setName] = useState('');
  const [copyRoster, setCopyRoster] = useState(true);

  if (!isAddGroupOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = name.trim().toUpperCase() || `GROUP ${String.fromCharCode(65 + (groups?.length || 0))}`;
    createGroup(clean, copyRoster);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10">
          <h3 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-warzone-gold" />
            <span>Create New Tournament Group</span>
          </h3>
          <button onClick={() => setIsAddGroupOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GROUP E or GRAND FINALS"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 cursor-pointer text-xs font-semibold">
            <input
              type="checkbox"
              checked={copyRoster}
              onChange={(e) => setCopyRoster(e.target.checked)}
              className="accent-warzone-red"
            />
            <span>Copy squad roster from active group (reset points to 0)</span>
          </label>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddGroupOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-red-glow px-5 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
