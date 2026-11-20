# 🏆 ESPORTS TOURNAMENT STANDINGS MANAGER

> **Brand:** WARZONE OFFICIAL  
> **Style:** Premium Esports Gaming Theme with Red Glowing Accents, Luxe Gold Highlights, and Glassmorphism Dashboard  
> **Target Games:** Free Fire, PUBG Mobile, Call of Duty: Warzone, Apex Legends, Battle Royale Scrims & Tournaments

---

## 🌟 Overview

The **Esports Tournament Standings Manager** is a high-performance tournament management dashboard designed specifically for esports organizers, broadcast streams, scrim administrators, and gaming leagues. 

It provides real-time scoring, automatic rank calculations, group stage management, complete match auditing with rollback/undo, dynamic theme customization, and 2.5x high-resolution PNG graphic exports formatted for Discord, Twitter, and Instagram esports announcements.

---

## 🚀 Key Features

### 1. 🎨 Esports Design & Branding
- **Dark Void Gaming Theme:** Deep charcoal `#0a0a0c` background with animated cosmic nebula drift and twinkling particle stars.
- **Warzone Red (`#FF3434`)** glowing action buttons, hover glow animations, and rank blocks.
- **Luxe Gold (`#FFD34D`)** accents, #1 leader badge, top-3 highlights, and total score pill.
- **Dynamic Leaderboard:** Pixel-perfect recreation of official esports scrim standing tables.
- **Fully Responsive:** Adapts smoothly across 4K displays, ultrawides, laptops, tablets, and smartphones.

### 2. ⚡ Top Navigation Bar
- **Brand Identity:** Tournament logo, organization title, and subtitle.
- **Admin Lock/Unlock:** Secure password-protected mode toggle (`admin123` by default).
- **Dark/Light Mode:** Instant switch between dark esports mode and crisp light mode.
- **Share Standings:** One-click public link and iframe embed code generator.
- **Fullscreen Broadcast Mode:** Clean full-screen display optimized for live stream overlays and stage monitors.
- **Settings Drawer:** Access all tournament configurations, scoring rules, and theme engines.
- **Download PNG Button:** Instant 2.5x retina-grade image export.

### 3. 👥 Multi-Group Tournament Management
- Supports **GROUP A**, **GROUP B**, **GROUP C**, **GROUP D**, and unlimited additional groups.
- Instant switching between groups without page reloads.
- Add, rename, duplicate, reorder, and delete groups.
- Each group maintains completely isolated squad rosters, scores, and match history logs.

### 4. 📊 Dynamic Main Leaderboard
- **Standard Battle Royale Columns:** `#` (Rank), `TEAM NAME`, `M.P` (Matches Played), `WIN`, `POS PTS` (Position Points), `KILL PTS` (Kill Points), `TOTAL` (Total Points).
- **Automatic Calculations:** `Total Points = Position Points + (Kill Points × Multiplier)`.
- **Automatic Tiebreakers:** Total Points → Wins → Kill Points → Position Points.
- **Top 3 Highlights:** 
  - Rank 1: Gold glowing border on team container, gold trophy icon 🏆, gold total points pill badge.
  - Rank 2: Silver medal 🥈, vibrant red total points pill badge.
  - Rank 3: Bronze medal 🥉, vibrant red total points pill badge.
- **Manual Ranking Override:** Toggle between automatic mathematical sorting and custom drag-and-drop ordering.
- **Inline Cell Editing:** Direct double-click editing on the leaderboard in Admin Mode.

### 5. ⚡ Quick Point Update Panel (Right-Side Control)
- **Select Group:** Synced with active tournament stage.
- **Select Squad:** Dropdown showing team name and current total points.
- **Match Number:** Automatically increments or custom number entry.
- **Finish Position Selector:** Pre-populates Position Points according to official Battle Royale rules (1st Booyah = 12 pts, 2nd = 9 pts, etc.).
- **Position Points & Kill Points:** Editable numeric fields.
- **Win / Booyah Checkbox:** Auto-checked when 1st position is chosen.
- **SAVE MATCH RESULT:** Large red glowing button with row highlight flash animation and sound feedback.
- **RESET FORM & UNDO LAST UPDATE:** One-click rollback and clear.

### 6. 🕒 Match History & Audit Log
- Chronological feed of all recorded match scores.
- Filter by squad or match number.
- **Edit Historical Results:** Edit position or kills from previous matches; squad cumulative stats automatically recompute.
- **Delete Record:** Safely rolls back matches played, wins, position points, and kills.
- **Undo Latest & Clear History:** With modal safeguards.

### 7. 🎨 Visual Customization & Themes
- **Preset Themes:**
  1. *Red Esports (Default Warzone)*
  2. *Gold Premium*
  3. *Blue Gaming*
  4. *Purple Neon*
  5. *Custom Theme (Full RGB Color Pickers)*
- Dynamic CSS Variable injection updates all elements in real-time.

### 8. 🔒 Secure Admin Authentication
- Password-protected admin access.
- SHA-256 hashed password verification (no plaintext passwords in frontend storage).
- Default Admin Password: `admin123` (customizable in Settings).
- Viewer Mode: Public viewers cannot tamper with scores, roster, or settings.

### 9. 💾 Persistent Database & Local Storage
- **Offline-First:** Automatically saves to browser `localStorage` and `IndexedDB`.
- **Zero-Dependency Windows Server:** Built-in PowerShell .NET HttpListener provides a local server and JSON database on `http://localhost:8080`.
- **Node.js Express + SQLite Backend:** Included in `server/` with REST API endpoints (`/api/tournament`, `/api/ping`).

---

## 📁 Project Structure

```text
D:\stream emulator\
├── index.html                  # Main application dashboard
├── run-server.bat              # One-click Windows launcher (starts server & opens browser)
├── run-server.ps1              # Built-in PowerShell .NET HttpListener HTTP/REST server
├── README.md                   # Comprehensive project documentation
├── INSTRUCTIONS.md             # User manual & quick start guide
├── assets/
│   ├── warzone-logo.png        # Official Warzone/Warborn emblem logo
│   └── default-teams/          # Custom squad icons
├── css/
│   ├── main.css                # Layout, typography, theme tokens, cosmic nebula fx
│   ├── leaderboard.css         # Leaderboard rows, top 3 highlights, stadium badges
│   ├── panels.css              # Quick update form, history log, glassmorphism cards
│   └── modals.css              # Settings drawer, admin modal, dialogs, toasts
├── js/
│   ├── config.js               # Default branding, scoring matrix, theme presets
│   ├── state.js                # State store, IndexedDB & localStorage engine, sync
│   ├── leaderboard.js          # Standings component, ranking algorithms, drag & drop
│   ├── quick-update.js         # Match entry form handler & validation
│   ├── match-history.js        # Audit log, edit record modal, rollback engine
│   ├── groups.js               # Multi-group switcher & manager
│   ├── admin.js                # SHA-256 password protection & session manager
│   ├── settings.js             # Visual customizer & tournament settings controller
│   ├── export.js               # PNG (html2canvas), PDF, CSV, JSON, and share links
│   └── app.js                  # Global bootstrap, synth audio, toasts, shortcuts
└── server/
    ├── package.json            # Node.js dependencies (express, cors, sqlite3)
    ├── database.js             # SQLite database table initializations
    └── server.js               # Express REST API & static file server
```

---

## 💻 Installation & Running Instructions

### Option 1: One-Click Windows Launcher (Recommended)
1. Double-click `run-server.bat`.
2. The script will detect your environment:
   - If Node.js is installed, it runs the Express + SQLite server.
   - If Node.js is not installed, it automatically launches the built-in Windows Standalone Server via PowerShell!
3. Your default browser opens automatically at `http://localhost:8080/index.html`.

### Option 2: Direct Offline Execution (Zero Setup)
- Double-click `index.html` directly in your file explorer to open it in Chrome, Edge, Brave, or Firefox.
- All features (Auto-save, IndexedDB, PNG export, Admin mode, scoring calculations) work 100% offline!

### Option 3: Node.js Express + SQLite Server
```bash
cd "D:\stream emulator\server"
npm install
npm start
```
The server will run on `http://localhost:8080` with persistent SQLite storage in `server/tournament.db`.

---

## 🔐 Admin Mode & Password

- Default Admin Password: **`admin123`**
- To unlock: Click **"Viewer Mode"** in the top navigation bar, enter `admin123`, and click **Unlock Admin**.
- To change password: Open **Settings** (⚙) → **Security** tab → Enter current and new passwords.

---

## 💾 Backup and Restore Procedures

### To Create a Backup:
1. Open **Settings** (⚙) → **Data & Backup** tab (or click **"Backup JSON"** on the Quick Actions panel).
2. Click **"Export Tournament JSON Backup"**.
3. A JSON file (`tournament_backup_YYYY-MM-DD.json`) containing all groups, rosters, match history, and theme settings will be downloaded to your computer.

### To Restore from a Backup:
1. Open **Settings** (⚙) → **Data & Backup** tab.
2. Under **"Restore Tournament"**, click **Choose File** and select your `.json` backup file.
3. The system will validate the file, restore all squads, groups, scores, and history, and refresh the dashboard instantly.

---

## 📄 License
MIT License. Built for professional esports tournament organizers and competitive gaming scrims.
