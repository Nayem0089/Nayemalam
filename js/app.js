/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Main Application Bootstrapper & UI Orchestrator
 */

class Application {
  constructor() {
    this.audioCtx = null;
    this.confirmCallback = null;
    this.isLightMode = false;
  }

  async init() {
    // 1. Initialize State
    await window.tournamentState.init();

    // 2. Check for shared snapshot in URL
    this.checkSharedUrlSnapshot();

    // 3. Initialize Controllers
    if (window.adminManager) await window.adminManager.init();
    if (window.groupsManager) window.groupsManager.init();
    if (window.leaderboard) window.leaderboard.init();
    if (window.quickUpdate) window.quickUpdate.init();
    if (window.matchHistory) window.matchHistory.init();
    if (window.settingsManager) window.settingsManager.init();

    // 4. Bind Topbar Buttons & Global Events
    this.bindGlobalEvents();

    // 5. Generate Particle Stars
    this.generateStarfield();

    console.log('🔥 Esports Tournament Standings Manager Ready');
  }

  bindGlobalEvents() {
    // Dark/Light Mode toggle
    const themeModeToggle = document.getElementById('themeModeToggle');
    if (themeModeToggle) {
      themeModeToggle.addEventListener('click', () => {
        this.toggleLightMode();
      });
    }

    // Share button
    const shareBtn = document.getElementById('topbarShareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        window.exportManager.openShareModal();
      });
    }

    // Download PNG button
    const dlPngBtn = document.getElementById('topbarDownloadPngBtn');
    if (dlPngBtn) {
      dlPngBtn.addEventListener('click', () => {
        window.exportManager.downloadPNG();
      });
    }

    // Fullscreen button
    const fsBtn = document.getElementById('topbarFullscreenBtn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Global Modal Backdrop clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });

    // Drawer Overlay click
    const drawerOverlay = document.getElementById('drawerOverlay');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => {
        window.settingsManager.close();
      });
    }

    // Global Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Confirm Dialog Yes/No
    const confirmOkBtn = document.getElementById('confirmModalOkBtn');
    if (confirmOkBtn) {
      confirmOkBtn.addEventListener('click', () => {
        if (typeof this.confirmCallback === 'function') {
          this.confirmCallback();
        }
        this.closeModal('confirmDialogModal');
      });
    }

    const confirmCancelBtn = document.getElementById('confirmModalCancelBtn');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        this.closeModal('confirmDialogModal');
      });
    }

    // Add Group Modal Form
    const confirmAddGroupBtn = document.getElementById('confirmAddGroupBtn');
    if (confirmAddGroupBtn) {
      confirmAddGroupBtn.addEventListener('click', () => {
        const input = document.getElementById('newGroupNameInput');
        const copyCheck = document.getElementById('copyRosterCheck');
        if (input) {
          window.groupsManager.createGroup(input.value, copyCheck ? copyCheck.checked : false);
        }
      });
    }

    // Edit Match Modal Save
    const saveEditMatchBtn = document.getElementById('saveEditHistoryBtn');
    if (saveEditMatchBtn) {
      saveEditMatchBtn.addEventListener('click', () => {
        window.matchHistory.saveEditedRecord();
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        if (window.settingsManager) window.settingsManager.close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        window.quickUpdate.undoLastUpdate();
      }
    });
  }

  // Check URL fragment for read-only share link
  checkSharedUrlSnapshot() {
    try {
      const hash = window.location.hash;
      if (hash && hash.includes('#share=')) {
        const encoded = hash.split('#share=')[1];
        if (encoded) {
          const jsonStr = decodeURIComponent(escape(atob(encoded)));
          const data = JSON.parse(jsonStr);
          if (data && data.teams) {
            window.tournamentState.state.activeGroup = data.group || 'SHARED STANDINGS';
            window.tournamentState.state.groups[window.tournamentState.state.activeGroup] = {
              id: 'grp_share',
              label: data.group || 'SHARED STANDINGS',
              teams: data.teams.map((t, i) => ({
                id: 'tm_share_' + i,
                name: t.name,
                logo: '',
                matches: t.m || 0,
                wins: t.w || 0,
                positionPoints: t.pp || 0,
                killPoints: t.kp || 0,
                total: t.tot || 0,
                order: i + 1
              })),
              history: []
            };
            window.tournamentState.state.groupOrder = [window.tournamentState.state.activeGroup];
            this.showToast('Loaded shared tournament snapshot');
          }
        }
      }
    } catch (e) {
      console.warn('Could not parse share URL snapshot', e);
    }
  }

  // Light Mode / Dark Mode Toggle
  toggleLightMode() {
    this.isLightMode = !this.isLightMode;
    const body = document.body;
    const icon = document.getElementById('themeModeIcon');

    if (this.isLightMode) {
      body.classList.add('light-mode');
      if (icon) icon.textContent = '☀️';
      this.showToast('Light mode active');
    } else {
      body.classList.remove('light-mode');
      if (icon) icon.textContent = '🌙';
      this.showToast('Dark gaming mode active');
    }
  }

  // Fullscreen Mode
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen error:', err);
      });
      this.showToast('Entered Fullscreen Broadcast Mode');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.showToast('Exited Fullscreen');
      }
    }
  }

  // Modal Controls
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('visible');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('visible');
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('visible');
    });
  }

  // Confirmation Dialog
  showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('confirmDialogModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.innerHTML = message;

    this.confirmCallback = onConfirm;
    this.openModal('confirmDialogModal');
  }

  // Toast Notifications
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;

    const icon = type === 'warning' ? '⚠️' : (type === 'error' ? '❌' : '✓');
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2800);
  }

  // Web Audio Synthesizer (Zero asset dependencies!)
  playSound(type = 'click') {
    if (!window.tournamentState.state.displayOptions.soundEffects) return;

    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        // High upbeat dual chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'undo') {
        // Low reverse chirp
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Subtle crisp UI click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Audio might be blocked before first user interaction
    }
  }

  // Dynamic Cosmic Particle Stars Generation
  generateStarfield() {
    const layer1 = document.getElementById('starsLayer1');
    const layer2 = document.getElementById('starsLayer2');
    if (!layer1 || !layer2) return;

    const makeBoxShadows = (count) => {
      const shadows = [];
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        const alpha = (0.2 + Math.random() * 0.7).toFixed(2);
        shadows.push(`${x}px ${y}px rgba(255, 255, 255, ${alpha})`);
      }
      return shadows.join(', ');
    };

    layer1.style.boxShadow = makeBoxShadows(120);
    layer2.style.boxShadow = makeBoxShadows(80);
  }
}

// Global bootstrap
window.app = new Application();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
