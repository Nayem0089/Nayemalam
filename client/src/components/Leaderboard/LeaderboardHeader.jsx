import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardHeader() {
  const { settings, activeGroup, updateSettings, uploadLogo, showToast } = useTournament();
  const { isAdmin } = useAuth();

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      showToast('Uploading tournament emblem...');
      const url = await uploadLogo(file);
      await updateSettings({ tournamentLogo: url, websiteLogo: url });
      showToast('Tournament logo updated!');
    } catch (err) {
      showToast('Logo upload failed', 'error');
    }
  };

  return (
    <header className="flex flex-col items-center text-center mb-6 relative">
      {/* Logo & Org Name Row */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <label
          className={`w-14 h-14 rounded-xl bg-[#141419] border-2 border-red-500/45 shadow-[0_0_16px_rgba(255,52,52,0.3)] flex items-center justify-center overflow-hidden relative ${
            isAdmin ? 'cursor-pointer hover:border-yellow-400' : ''
          }`}
          title={isAdmin ? 'Click to change logo' : ''}
        >
          <img
            src={settings?.tournamentLogo || '/assets/warzone-logo.png'}
            alt="Emblem"
            className="w-[90%] h-[90%] object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {isAdmin && (
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          )}
        </label>
        
        <div className="font-heading text-xl font-semibold tracking-[0.16em] text-white uppercase leading-none">
          {settings?.websiteName || 'WARZONE OFFICIAL'}
        </div>
      </div>

      {/* Main Tournament Title */}
      <h1 className="font-heading text-[clamp(34px,4.2vw,48px)] font-bold tracking-wider text-white uppercase leading-none mt-1">
        {settings?.tournamentName || 'DAILY PAID SCRIM'}
      </h1>

      {/* Subtitle */}
      <div className="font-heading text-[clamp(17px,2.2vw,22px)] font-semibold tracking-[0.16em] text-warzone-gold italic uppercase mt-0.5">
        {settings?.tournamentSubtitle || 'OVERALL STANDINGS'}
      </div>

      {/* Match Info Line */}
      <div className="font-sans text-[12.5px] font-semibold text-gray-400 tracking-wider uppercase mt-1">
        {settings?.matchInfoLine || 'WEEK 01 DAY 01'}
      </div>

      {/* Group Pill Badge */}
      <div className="inline-block mt-3 px-5 py-1 rounded-full bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border border-yellow-500/45 text-yellow-300 font-heading text-lg font-semibold tracking-widest uppercase">
        {activeGroup?.name || 'GROUP A'}
      </div>
    </header>
  );
}
