import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../context/TournamentContext';
import { exportToPng } from '../utils/exportUtils';
import { Lock, Unlock, Moon, Sun, Share2, Maximize, Settings, Download } from 'lucide-react';

export default function Navbar() {
  const { isAdmin, setIsLoginModalOpen, logout } = useAuth();
  const {
    settings,
    activeGroup,
    isLightMode,
    setIsLightMode,
    setIsSettingsOpen,
    setIsShareOpen,
    showToast
  } = useTournament();

  const handleAdminToggle = () => {
    if (isAdmin) {
      logout();
      showToast('Admin session locked — Viewer Mode active');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast('Entered Fullscreen Broadcast Mode');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        showToast('Exited Fullscreen');
      }
    }
  };

  const handleDownloadPng = async () => {
    showToast('Generating high-resolution PNG graphic...');
    try {
      const org = (settings?.websiteName || 'WARZONE').replace(/[^a-zA-Z0-9]/g, '');
      const tourn = (settings?.tournamentName || 'TOURNAMENT').replace(/[^a-zA-Z0-9]/g, '');
      const grp = (activeGroup?.name || 'GROUP').replace(/[^a-zA-Z0-9]/g, '');
      await exportToPng('captureArea', `${org}_${tourn}_${grp}_Standings.png`);
      showToast('PNG Downloaded Successfully!');
    } catch (e) {
      showToast('Failed to generate PNG image', 'error');
    }
  };

  const handleOpenSettings = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      setIsSettingsOpen(true);
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 p-3.5 px-5 mb-5 bg-[#121216]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex-wrap">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/40 flex items-center justify-center overflow-hidden">
          <img
            src={settings?.websiteLogo || '/assets/warzone-logo.png'}
            alt="Logo"
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex flex-col">
          <div className="font-heading text-xl font-bold tracking-wider text-white flex items-center gap-1.5 leading-none">
            {settings?.websiteName || 'WARZONE'} <span className="text-warzone-gold">OFFICIAL</span>
          </div>
          <div className="text-[11px] text-gray-400 tracking-wider uppercase">
            Tournament Standings Manager
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Admin Mode Toggle */}
        <button
          onClick={handleAdminToggle}
          className={`btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isAdmin
              ? 'bg-gradient-to-r from-red-500/25 to-yellow-500/20 border-red-500 text-yellow-300 shadow-md shadow-red-500/30'
              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
          }`}
          title="Toggle Admin Mode"
        >
          {isAdmin ? <Unlock className="w-3.5 h-3.5 text-yellow-400" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{isAdmin ? 'Admin Mode' : 'Viewer Mode'}</span>
        </button>

        {/* Light/Dark Mode Toggle */}
        <button
          onClick={() => {
            const next = !isLightMode;
            setIsLightMode(next);
            if (next) document.body.classList.add('light-mode');
            else document.body.classList.remove('light-mode');
          }}
          className="btn p-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
          title="Toggle Light/Dark Mode"
        >
          {isLightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Share Button */}
        <button
          onClick={() => setIsShareOpen(true)}
          className="btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleFullscreen}
          className="btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
          title="Fullscreen Broadcast Mode"
        >
          <Maximize className="w-3.5 h-3.5" />
          <span>Fullscreen</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={handleOpenSettings}
          className="btn inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
        >
          <Settings className="w-3.5 h-3.5 text-yellow-400" />
          <span>Settings</span>
        </button>

        {/* Download PNG Button (Red Glowing) */}
        <button
          onClick={handleDownloadPng}
          className="btn btn-red-glow inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG</span>
        </button>
      </div>
    </header>
  );
}
