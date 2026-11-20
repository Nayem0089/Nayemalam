/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Export & Sharing Engine (PNG, PDF, CSV, JSON, Public Link)
 */

class ExportManager {
  constructor() {}

  // 1. Download High-Resolution PNG (Matches reference screenshot)
  async downloadPNG() {
    const captureArea = document.getElementById('captureArea');
    if (!captureArea) return;

    window.app.showToast('Generating high-resolution PNG image...');

    try {
      // Temporarily hide any admin-only visual cues for pure clean broadcast capture
      document.body.classList.add('capturing-png');

      const canvas = await html2canvas(captureArea, {
        scale: 2.5, // 2.5x retina quality for ultra crisp text and badges
        backgroundColor: '#0a0a0b',
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      document.body.classList.remove('capturing-png');

      const image = canvas.toDataURL('image/png');
      const state = window.tournamentState.state;
      const org = (state.settings.websiteName || 'WARZONE').replace(/[^a-zA-Z0-9]/g, '');
      const tourn = (state.settings.tournamentName || 'TOURNAMENT').replace(/[^a-zA-Z0-9]/g, '');
      const group = (state.activeGroup || 'GROUP').replace(/[^a-zA-Z0-9]/g, '');
      const filename = `${org}_${tourn}_${group}_Standings.png`;

      const link = document.createElement('a');
      link.href = image;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.app.playSound('success');
      window.app.showToast('PNG Downloaded Successfully!');
    } catch (err) {
      document.body.classList.remove('capturing-png');
      console.error('PNG export failed:', err);
      window.app.showToast('Failed to export PNG: ' + err.message, 'warning');
    }
  }

  // 2. Export Standings as CSV
  exportCSV() {
    const group = window.tournamentState.getActiveGroup();
    if (!group || !group.teams) return;

    const sortedTeams = window.leaderboard.getSortedTeams();
    const headers = ['Rank', 'Squad Name', 'Matches Played', 'Wins', 'Position Points', 'Kill Points', 'Total Points'];
    const rows = sortedTeams.map((t, idx) => [
      idx + 1,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      t.matches || 0,
      t.wins || 0,
      t.positionPoints || 0,
      t.killPoints || 0,
      t.total || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${group.label}_Standings.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showToast(`Exported ${group.label} Standings CSV`);
  }

  // 3. Print / PDF Export
  exportPDF() {
    window.app.showToast('Opening print dialog for PDF export...');
    setTimeout(() => {
      window.print();
    }, 300);
  }

  // 4. Export Complete Tournament State as JSON (Full Backup)
  exportJSON() {
    const state = window.tournamentState.state;
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tournament_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.app.showToast('Full tournament backup saved as JSON');
  }

  // 5. Import Tournament JSON
  importJSON(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.groups || !parsed.settings) {
          throw new Error('Invalid tournament file format.');
        }

        window.tournamentState.pushUndoSnapshot();
        window.tournamentState.state = parsed;
        window.tournamentState.save();

        if (window.settingsManager) {
          window.settingsManager.applyCurrentTheme();
          window.settingsManager.syncFormValues();
        }

        window.app.showToast('Tournament backup restored successfully!');
      } catch (err) {
        window.app.showToast('Import failed: ' + err.message, 'warning');
      }
    };
    reader.readAsText(file);
  }

  // 6. Share Leaderboard Link
  openShareModal() {
    const group = window.tournamentState.getActiveGroup();
    const state = window.tournamentState.state;

    // Build snapshot for sharing
    const snapshot = {
      group: group.label,
      org: state.settings.websiteName,
      tourn: state.settings.tournamentName,
      sub: state.settings.tournamentSubtitle,
      info: state.settings.matchInfoLine,
      teams: group.teams.map(t => ({
        name: t.name,
        m: t.matches,
        w: t.wins,
        pp: t.positionPoints,
        kp: t.killPoints,
        tot: t.total
      }))
    };

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))));
    const shareUrl = `${window.location.origin}${window.location.pathname}#share=${encoded}`;

    const linkInput = document.getElementById('sharePublicLinkInput');
    const embedInput = document.getElementById('shareEmbedCodeInput');

    if (linkInput) linkInput.value = shareUrl;
    if (embedInput) {
      embedInput.value = `<iframe src="${shareUrl}" width="100%" height="900" frameborder="0"></iframe>`;
    }

    window.app.openModal('shareModal');
  }

  copyShareLink() {
    const linkInput = document.getElementById('sharePublicLinkInput');
    if (!linkInput) return;

    linkInput.select();
    navigator.clipboard.writeText(linkInput.value).then(() => {
      window.app.showToast('Share link copied to clipboard!');
    }).catch(() => {
      document.execCommand('copy');
      window.app.showToast('Share link copied!');
    });
  }

  copyEmbedCode() {
    const embedInput = document.getElementById('shareEmbedCodeInput');
    if (!embedInput) return;

    embedInput.select();
    navigator.clipboard.writeText(embedInput.value).then(() => {
      window.app.showToast('Embed code copied!');
    }).catch(() => {
      document.execCommand('copy');
      window.app.showToast('Embed code copied!');
    });
  }
}

// Global instance
window.exportManager = new ExportManager();
