import React from 'react';
import { useTournament } from '../../context/TournamentContext';

export default function LeaderboardFooter({ squadCount = 0 }) {
  const { settings, autoRanking } = useTournament();

  return (
    <footer className="flex items-center justify-between pt-5 px-3 text-[11.5px] text-[#72717c] tracking-wide select-none">
      <span>{settings?.footerText || 'Powered by WARZONE OFFICIAL'}</span>
      <span>{squadCount} Squads · {autoRanking ? 'Auto-Ranked' : 'Manual Order'}</span>
    </footer>
  );
}
