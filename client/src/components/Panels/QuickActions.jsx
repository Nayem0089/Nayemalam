import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv, exportToJson, printStandings } from '../../utils/exportUtils';
import { Wrench, Plus, FileSpreadsheet, Printer, Download } from 'lucide-react';

export default function QuickActions() {
  const { data, activeGroup, rawTeams, setIsSettingsOpen, showToast } = useTournament();
  const { isAdmin, setIsLoginModalOpen } = useAuth();

  const handleAddSquadClick = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      setIsSettingsOpen(true);
    }
  };

  const handleCsvExport = () => {
    exportToCsv(activeGroup?.name, rawTeams);
    showToast(`Exported ${activeGroup?.name} CSV`);
  };

  const handleJsonBackup = () => {
    exportToJson(data, `warzone_backup_${new Date().toISOString().slice(0, 10)}.json`);
    showToast('Downloaded complete tournament JSON backup');
  };

  return (
    <div className="bg-[#121216]/90 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 px-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2 leading-none">
          <Wrench className="w-5 h-5 text-warzone-gold" />
          <span>Quick Actions</span>
        </h2>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAddSquadClick}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-yellow-400" />
            <span>Add Squad</span>
          </button>

          <button
            onClick={handleCsvExport}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={printStandings}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={handleJsonBackup}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-200 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
