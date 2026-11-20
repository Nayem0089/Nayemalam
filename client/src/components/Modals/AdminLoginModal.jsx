import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';
import { Lock, X } from 'lucide-react';

export default function AdminLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useAuth();
  const { showToast } = useTournament();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(password);
      showToast('Admin Mode Activated — Full Editing Enabled');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Incorrect password. (Default is admin123)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10">
          <h3 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-warzone-gold" />
            <span>Enter Admin Password</span>
          </h3>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Admin authentication is required to modify tournament standings, roster squad names, match results, and settings.<br />
            <span className="text-yellow-400 font-semibold">Default password: admin123</span>
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
            />
            {error && (
              <span className="text-red-400 text-xs mt-1">{error}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-red-glow px-5 py-2 rounded-xl text-xs font-bold text-white tracking-wide"
            >
              {loading ? 'Verifying...' : 'Unlock Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
