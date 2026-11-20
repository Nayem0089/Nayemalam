import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmDialog() {
  const { confirmDialog } = useTournament();

  if (!confirmDialog) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10">
          <h3 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{confirmDialog.title || 'Confirm Action'}</span>
          </h3>
          <button onClick={confirmDialog.onCancel} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div
            className="text-xs text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: confirmDialog.message }}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={confirmDialog.onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className="btn btn-red-glow px-5 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
