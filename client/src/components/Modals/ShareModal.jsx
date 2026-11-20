import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Share2, Copy, Check, X } from 'lucide-react';

export default function ShareModal() {
  const { isShareOpen, setIsShareOpen, showToast } = useTournament();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isShareOpen) return null;

  const publicUrl = window.location.origin;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="950" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast('Public standings link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    showToast('Embed widget code copied!');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 px-5 border-b border-white/10">
          <h3 className="font-heading text-2xl font-bold tracking-wide text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-warzone-gold" />
            <span>Share Leaderboard</span>
          </h3>
          <button onClick={() => setIsShareOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">Public Standings Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-gold-glow px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] font-bold text-gray-400 uppercase tracking-wider">IFrame Embed Widget</label>
            <div className="flex flex-col gap-2">
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-mono text-xs outline-none resize-none"
              />
              <button
                onClick={handleCopyEmbed}
                className="self-end btn btn-gold-glow px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmbed ? 'Copied' : 'Copy Embed'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsShareOpen(false)}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
