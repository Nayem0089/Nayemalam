/**
 * EXPORT UTILITIES (PNG, CSV, JSON, PDF)
 */

import html2canvas from 'html2canvas';

export async function exportToPng(elementId, filename = 'standings.png') {
  const element = document.getElementById(elementId);
  if (!element) return;

  document.body.classList.add('capturing-png');

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // 2.5x retina quality for ultra crisp text & esports badges
      backgroundColor: '#0a0a0c',
      useCORS: true,
      allowTaint: true,
      logging: false
    });

    document.body.classList.remove('capturing-png');

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    document.body.classList.remove('capturing-png');
    console.error('PNG export failed:', err);
    throw err;
  }
}

export function exportToCsv(groupName, teams) {
  if (!teams || !teams.length) return;

  const headers = ['Rank', 'Squad Name', 'Matches Played', 'Wins', 'Position Points', 'Kill Points', 'Total Points'];
  const rows = teams.map((t, idx) => [
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
  link.setAttribute('download', `${groupName || 'Tournament'}_Standings.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJson(data, filename = 'tournament_backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printStandings() {
  window.print();
}
