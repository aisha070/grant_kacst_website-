/* ================================================================
   KACST Dashboard — Configuration File
   ► This is the ONLY file you need to edit to change data sources.
   ================================================================

   HOW TO CHANGE THE SHEET:
   1. Copy your new Google Sheet URL
   2. Find the long ID between /d/ and /edit in the URL
   3. Paste it as the value of SHEET_ID below

   HOW TO CHANGE TAB NAMES:
   - Make sure your Google Sheet tab names match exactly below
   - Names are case-sensitive: "stats" ≠ "Stats"

   SHEET MUST BE PUBLIC:
   - Google Sheets → Share → "Anyone with the link" → Viewer
   ================================================================ */

// ── Google Sheet ID ─────────────────────────────────────────────
const SHEET_ID = '1huk2-FwdmBYojO2oLEoWFtkI-GXkZiw1fHjwlOSSgok';

// ── Tab names (must match Google Sheets tab names exactly) ───────
const TAB = {
  stats:    'stats',      // Top 4 KPI numbers
  about:    'about',      // "حول" tab: nabtha, objectives, KPIs
  programs: 'programs',   // Program cards (81 programs)
  settings: 'settings',   // Theme: colors, fonts, shadows
};
