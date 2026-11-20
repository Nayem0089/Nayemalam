import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Check, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toasts } = useTournament();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';
        const isError = t.type === 'error';

        return (
          <div
            key={t.id}
            className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-2xl transition-all duration-300 pointer-events-auto bg-[#141419] border ${
              isSuccess
                ? 'border-emerald-500/50 shadow-emerald-500/20'
                : isWarning
                ? 'border-amber-500/50 shadow-amber-500/20'
                : 'border-red-500/50 shadow-red-500/20'
            }`}
          >
            {isSuccess && <Check className="w-4 h-4 text-emerald-400" />}
            {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {isError && <X className="w-4 h-4 text-red-400" />}
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
