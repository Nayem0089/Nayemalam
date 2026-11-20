import React, { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTournament } from './context/TournamentContext';
import CosmicBackground from './components/UI/CosmicBackground';
import Toast from './components/UI/Toast';
import Navbar from './components/Navbar';
import GroupTabs from './components/GroupTabs';
import LeaderboardCard from './components/Leaderboard/LeaderboardCard';
import QuickPointUpdate from './components/Panels/QuickPointUpdate';
import MatchHistory from './components/Panels/MatchHistory';
import QuickActions from './components/Panels/QuickActions';
import AdminLoginModal from './components/Modals/AdminLoginModal';
import SettingsDrawer from './components/Modals/SettingsDrawer';
import EditMatchModal from './components/Modals/EditMatchModal';
import AddGroupModal from './components/Modals/AddGroupModal';
import ShareModal from './components/Modals/ShareModal';
import ConfirmDialog from './components/Modals/ConfirmDialog';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const { isAdmin, setIsLoginModalOpen, logout } = useAuth();
  const { loading, showToast } = useTournament();

  // If user visits /admin or /admin/, prompt login modal automatically if not already admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin') && !isAdmin) {
      setIsLoginModalOpen(true);
    }
  }, [isAdmin, setIsLoginModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-warzone-void flex flex-col items-center justify-center text-white gap-3">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-heading text-2xl tracking-widest text-warzone-gold uppercase">
          Loading Tournament Manager...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Cosmic Nebula FX */}
      <CosmicBackground />

      {/* Main Container */}
      <div className="max-w-[1480px] mx-auto p-4 md:p-6 pb-20">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Admin Mode Active Notice Banner */}
        {isAdmin && (
          <div className="flex items-center justify-between p-2.5 px-4 mb-4 rounded-xl bg-gradient-to-r from-red-500/20 via-yellow-500/15 to-transparent border border-red-500/40 text-xs text-yellow-300 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <b>ADMIN MODE ACTIVE:</b> Full score editing, squad roster management, match rollback, and customizer enabled.
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                showToast('Admin session locked');
              }}
              className="px-3 py-1 rounded-lg border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold"
            >
              Lock Session
            </button>
          </div>
        )}

        {/* Tournament Group Switcher Tabs */}
        <GroupTabs />

        {/* Main Dashboard 2-Column Grid */}
        <main className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
          {/* LEFT: Official Leaderboard Standings Card */}
          <section className="w-full">
            <LeaderboardCard />
          </section>

          {/* RIGHT: Quick Point Update, History, & Actions Sidebar */}
          <aside className="flex flex-col gap-5 w-full">
            <QuickPointUpdate />
            <MatchHistory />
            <QuickActions />
          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500 flex items-center justify-center gap-4 flex-wrap">
          <span>WARZONE OFFICIAL — Esports Tournament Standings Manager</span>
          <span>•</span>
          <span>Production Ready for Render.com</span>
          <span>•</span>
          <span>PostgreSQL & Prisma</span>
        </footer>

      </div>

      {/* Modals & Drawers */}
      <AdminLoginModal />
      <SettingsDrawer />
      <EditMatchModal />
      <AddGroupModal />
      <ShareModal />
      <ConfirmDialog />
      <Toast />
    </div>
  );
}
