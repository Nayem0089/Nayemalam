/**
 * ESPORTS TOURNAMENT STANDINGS MANAGER
 * Secure Admin Mode & Authentication Controller
 */

class AdminManager {
  constructor() {
    this.isAdmin = false;
    this.sessionKey = 'esports_admin_session_auth';
  }

  async init() {
    this.checkSession();
    this.bindEvents();
    this.updateUI();
  }

  checkSession() {
    const session = sessionStorage.getItem(this.sessionKey);
    if (session === 'authenticated') {
      this.isAdmin = true;
    }
  }

  bindEvents() {
    // Topbar Admin Toggle
    const adminToggleBtn = document.getElementById('adminModeToggleBtn');
    if (adminToggleBtn) {
      adminToggleBtn.addEventListener('click', () => {
        if (this.isAdmin) {
          this.lockAdmin();
        } else {
          this.openPasswordModal();
        }
      });
    }

    // Password modal submit
    const submitBtn = document.getElementById('submitAdminPassBtn');
    const passInput = document.getElementById('adminPasswordInput');

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.verifyPassword();
      });
    }

    if (passInput) {
      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.verifyPassword();
        }
      });
    }
  }

  openPasswordModal() {
    const input = document.getElementById('adminPasswordInput');
    const errEl = document.getElementById('adminPassError');
    if (input) input.value = '';
    if (errEl) errEl.style.display = 'none';
    window.app.openModal('adminPasswordModal');
    if (input) setTimeout(() => input.focus(), 150);
  }

  // SHA-256 Hash implementation using Web Crypto API
  async hashPassword(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword() {
    const input = document.getElementById('adminPasswordInput');
    const errEl = document.getElementById('adminPassError');
    const plainText = input ? input.value : '';

    if (!plainText) {
      if (errEl) {
        errEl.textContent = 'Please enter the admin password';
        errEl.style.display = 'block';
      }
      return;
    }

    const hashed = await this.hashPassword(plainText);
    const storedHash = (window.tournamentState.state && window.tournamentState.state.adminPasswordHash)
      || DEFAULT_CONFIG.admin.passwordHash;

    if (hashed === storedHash) {
      this.isAdmin = true;
      sessionStorage.setItem(this.sessionKey, 'authenticated');
      window.app.closeModal('adminPasswordModal');
      this.updateUI();
      window.app.playSound('success');
      window.app.showToast('Admin Mode Activated — Full Editing Enabled');
    } else {
      if (errEl) {
        errEl.textContent = 'Incorrect password. (Default is admin123)';
        errEl.style.display = 'block';
      }
      const modal = document.querySelector('#adminPasswordModal .modal-card');
      if (modal) {
        modal.classList.add('shake-anim');
        setTimeout(() => modal.classList.remove('shake-anim'), 600);
      }
    }
  }

  lockAdmin() {
    this.isAdmin = false;
    sessionStorage.removeItem(this.sessionKey);
    this.updateUI();
    window.app.showToast('Admin Mode Locked — Viewer Mode');
  }

  updateUI() {
    const toggleBtn = document.getElementById('adminModeToggleBtn');
    const toggleIcon = document.getElementById('adminToggleIcon');
    const toggleText = document.getElementById('adminToggleText');
    const adminBanner = document.getElementById('adminNoticeBanner');

    if (this.isAdmin) {
      document.body.classList.add('admin-mode-active');
      if (toggleBtn) toggleBtn.classList.add('admin-active');
      if (toggleIcon) toggleIcon.textContent = '🔓';
      if (toggleText) toggleText.textContent = 'Admin Mode';
      if (adminBanner) adminBanner.style.display = 'flex';
    } else {
      document.body.classList.remove('admin-mode-active');
      if (toggleBtn) toggleBtn.classList.remove('admin-active');
      if (toggleIcon) toggleIcon.textContent = '🔒';
      if (toggleText) toggleText.textContent = 'Viewer Mode';
      if (adminBanner) adminBanner.style.display = 'none';
    }

    // Refresh components
    if (window.leaderboard) window.leaderboard.render();
    if (window.groupsManager) window.groupsManager.render();
    if (window.matchHistory) window.matchHistory.render();
  }

  async changePassword(oldPass, newPass) {
    const oldHash = await this.hashPassword(oldPass);
    const storedHash = (window.tournamentState.state && window.tournamentState.state.adminPasswordHash)
      || DEFAULT_CONFIG.admin.passwordHash;

    if (oldHash !== storedHash) {
      return { success: false, message: 'Current password does not match' };
    }

    if (!newPass || newPass.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters' };
    }

    const newHash = await this.hashPassword(newPass);
    window.tournamentState.state.adminPasswordHash = newHash;
    window.tournamentState.save();
    return { success: true, message: 'Admin password changed successfully' };
  }
}

// Global instance
window.adminManager = new AdminManager();
