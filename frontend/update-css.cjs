const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const replacement = `
/* ==========================================================================
   EDITORIAL DESIGN SYSTEM TOKENS
   Product-design driven, restrained, and authentic.
   ========================================================================== */

:root {
  /* Layout & Spacing */
  --header-height: 64px;
  --sidebar-width: 260px;
  --sidebar-width-collapsed: 72px;

  /* Light Theme Colors */
  --color-background: #fafafa;
  --color-background-secondary: #f2f2f2;
  --color-surface: #ffffff;
  --color-surface-hover: #f7f7f7;
  --color-surface-active: #eeeeee;
  
  --color-foreground: #111111;
  --color-foreground-secondary: #555555;
  --color-foreground-tertiary: #888888;
  
  --color-muted: #888888;
  
  /* Borders */
  --color-border: #e0e0e0;
  --color-border-light: #eeeeee;
  
  /* Accent (Muted tone) */
  --color-accent: #2c2c2c;
  --color-accent-hover: #1a1a1a;
  --color-accent-light: rgba(44, 44, 44, 0.08);
  --color-accent-ghost: rgba(44, 44, 44, 0.04);

  /* Status Colors (Functional only) */
  --color-success: #2e7d32;
  --color-success-light: rgba(46, 125, 50, 0.1);
  --color-warning: #ed6c02;
  --color-warning-light: rgba(237, 108, 2, 0.1);
  --color-danger: #d32f2f;
  --color-danger-light: rgba(211, 47, 47, 0.1);
  --color-info: #0288d1;
  --color-info-light: rgba(2, 136, 209, 0.1);
  
  /* Shadows (Subtle depth) */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 0 2px rgba(44, 44, 44, 0.15);
  --shadow-glow-danger: 0 0 0 2px rgba(211, 47, 47, 0.15);
  
  /* Radii */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}

[data-theme='dark'] {
  /* Dark Theme Colors */
  --color-background: #0a0a0a;
  --color-background-secondary: #121212;
  --color-surface: #141414;
  --color-surface-hover: #1c1c1c;
  --color-surface-active: #242424;
  
  --color-foreground: #ededed;
  --color-foreground-secondary: #a1a1aa;
  --color-foreground-tertiary: #71717a;
  
  --color-muted: #71717a;
  
  /* Borders */
  --color-border: #27272a;
  --color-border-light: #1f1f22;
  
  /* Accent */
  --color-accent: #f4f4f5;
  --color-accent-hover: #ffffff;
  --color-accent-light: rgba(244, 244, 245, 0.15);
  --color-accent-ghost: rgba(244, 244, 245, 0.08);

  /* Status Colors */
  --color-success: #4ade80;
  --color-success-light: rgba(74, 222, 128, 0.15);
  --color-warning: #facc15;
  --color-warning-light: rgba(250, 204, 21, 0.15);
  --color-danger: #f87171;
  --color-danger-light: rgba(248, 113, 113, 0.15);
  --color-info: #38bdf8;
  --color-info-light: rgba(56, 189, 248, 0.15);
  
  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.9), 0 10px 10px -5px rgba(0, 0, 0, 0.7);
  --shadow-glow: 0 0 0 2px rgba(244, 244, 245, 0.2);
}

@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  
  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-border: var(--color-border);
  --color-primary: var(--color-accent);
  --color-secondary: var(--color-muted);
  --color-foreground: var(--color-foreground);
  --color-muted: var(--color-muted);
}

/* ==========================================================================
   GLOBAL RESET & BASE STYLES
   ========================================================================== */
@layer base {
  * { 
    @apply box-border;
    border-color: var(--color-border);
  }

  body {
    @apply min-h-screen overflow-x-hidden font-sans antialiased text-[15px];
    background: var(--color-background);
    color: var(--color-foreground);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  ::selection {
    background: var(--color-accent);
    color: var(--color-background);
  }

  :focus-visible {
    outline: none;
    box-shadow: var(--shadow-glow);
    border-radius: var(--radius-sm);
  }

  /* Custom Scrollbar - Minimal */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { 
    background: var(--color-border); 
    border-radius: 999px; 
  }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-foreground-tertiary); }

  /* Minimal scroll reveal */
  .reveal {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Fix for landing page scrolling */
  html.landing-scroll body {
    overflow: auto;
    overflow-x: hidden;
  }
}

/* ==========================================================================
   UTILITIES
   ========================================================================== */
@utility animate-shimmer {
  background: linear-gradient(90deg, transparent 0%, var(--color-surface-active) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* ==========================================================================
   COMPONENTS
   ========================================================================== */
@layer components {
  
  /* -- Layout -- */
  .layout {
    @apply flex h-screen overflow-hidden;
    background: transparent;
  }

  .main-content {
    @apply flex-1 overflow-y-auto relative;
    background: transparent;
    padding: 32px 48px;
    scroll-behavior: smooth;
  }
  
  @media (max-width: 1024px) {
    .main-content { padding: 24px 24px; }
  }

  .page {
    @apply min-h-full pb-20 max-w-7xl mx-auto;
  }

  /* Typography */
  .page-header { @apply mb-10 flex flex-col gap-2; }
  .page-title {
    @apply text-3xl font-semibold tracking-tight;
    color: var(--color-foreground);
    letter-spacing: -0.02em;
  }
  .page-subtitle {
    @apply text-base;
    color: var(--color-foreground-secondary);
  }

  /* -- Buttons (Editorial style) -- */
  .btn {
    @apply relative inline-flex items-center justify-center gap-2 font-medium transition-colors;
    border-radius: var(--radius-sm);
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }
  
  .btn:active { opacity: 0.8; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn:focus-visible { box-shadow: var(--shadow-glow); }

  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-md { padding: 8px 16px; font-size: 14px; }
  .btn-lg { padding: 12px 24px; font-size: 15px; }
  
  .btn-icon { padding: 8px; border-radius: var(--radius-sm); }
  .btn-icon-sm { padding: 6px; border-radius: var(--radius-xs); }

  .btn-primary {
    background: var(--color-accent);
    color: var(--color-background);
  }
  .btn-primary:hover:not(:disabled) { 
    background: var(--color-accent-hover); 
  }

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-foreground);
    border: 1px solid var(--color-border);
  }
  .btn-secondary:hover:not(:disabled) { 
    background: var(--color-surface-hover); 
    border-color: var(--color-foreground-tertiary);
  }

  .btn-ghost {
    background: transparent;
    color: var(--color-foreground-secondary);
  }
  .btn-ghost:hover:not(:disabled) { 
    background: var(--color-surface-active); 
    color: var(--color-foreground); 
  }

  .btn-danger {
    background: var(--color-danger);
    color: white;
  }
  .btn-danger:focus-visible { box-shadow: var(--shadow-glow-danger); }

  /* -- Cards (Clean, rigid) -- */
  .card {
    @apply relative transition-colors duration-200;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }
  
  .card:hover {
    border-color: var(--color-border-light);
  }

  .card-header { @apply px-6 pt-6 pb-4 flex items-center justify-between; }
  .card-body { @apply px-6 py-4; }
  .card-footer { 
    @apply px-6 py-4 mt-2 flex items-center justify-between border-t;
    border-color: var(--color-border-light);
    background: var(--color-background-secondary);
  }

  /* -- Inputs & Forms -- */
  .input {
    @apply w-full transition-colors duration-200 outline-none;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-foreground);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    font-size: 14px;
  }
  .input::placeholder { color: var(--color-foreground-tertiary); }
  .input:hover { border-color: var(--color-foreground-tertiary); }
  .input:focus {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-glow);
  }
  
  .search-input {
    @apply flex items-center gap-3 transition-colors duration-200;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 8px 12px;
  }
  .search-input:focus-within {
    border-color: var(--color-accent);
    box-shadow: var(--shadow-glow);
  }
  .search-input input {
    @apply flex-1 bg-transparent text-sm outline-none w-full;
    color: var(--color-foreground);
  }
  .search-input input::placeholder { color: var(--color-foreground-tertiary); }

  /* -- Keyboard hints -- */
  .kbd-hint {
    @apply inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold;
    border-radius: 4px;
    background: var(--color-surface-active);
    border: 1px solid var(--color-border);
    color: var(--color-foreground-secondary);
    min-width: 18px;
  }

  /* -- Badges -- */
  .badge {
    @apply inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium;
    border-radius: var(--radius-sm);
  }
  .badge-accent { background: var(--color-accent-light); color: var(--color-accent); }
  .badge-success { background: var(--color-success-light); color: var(--color-success); }
  .badge-warning { background: var(--color-warning-light); color: var(--color-warning); }
  .badge-danger { background: var(--color-danger-light); color: var(--color-danger); }
  .badge-info { background: var(--color-info-light); color: var(--color-info); }
  .badge-neutral { background: var(--color-surface-active); color: var(--color-foreground-secondary); }

  /* -- Avatars -- */
  .avatar {
    @apply inline-flex items-center justify-center font-medium overflow-hidden;
    background: var(--color-surface-active);
    color: var(--color-foreground-secondary);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
  }
  .avatar img { @apply w-full h-full object-cover; }
  .avatar-sm { width: 28px; height: 28px; font-size: 11px; }
  .avatar-md { width: 36px; height: 36px; font-size: 13px; }
  .avatar-lg { width: 44px; height: 44px; font-size: 15px; }
  .avatar-xl { width: 56px; height: 56px; font-size: 18px; }

  /* -- Tables -- */
  .table-container {
    @apply w-full overflow-hidden border;
    border-color: var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
  }
  table { @apply w-full text-sm text-left; border-collapse: separate; border-spacing: 0; }
  thead th {
    @apply px-6 py-4 font-medium;
    color: var(--color-foreground-secondary);
    background: var(--color-background-secondary);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }
  tbody td {
    @apply px-6 py-4;
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-foreground);
  }
  tbody tr { transition: background var(--transition-fast); }
  tbody tr:hover { background: var(--color-surface-hover); }
  tbody tr:last-child td { border-bottom: none; }

  /* -- Modals & Overlays -- */
  .modal-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6;
    background: rgba(0, 0, 0, 0.6);
  }
  .modal {
    @apply w-full max-w-lg relative overflow-hidden;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  .modal-header {
    @apply px-8 pt-8 pb-4 flex items-center justify-between;
  }
  .modal-body {
    @apply px-8 py-4 overflow-y-auto;
  }
  .modal-footer {
    @apply px-8 py-6 mt-4 flex items-center justify-end gap-3;
    background: var(--color-background-secondary);
    border-top: 1px solid var(--color-border-light);
  }

  /* -- Dropdowns / Menus -- */
  .dropdown {
    @apply absolute z-50 min-w-[220px] p-1.5;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }
  .dropdown-item {
    @apply flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer;
    color: var(--color-foreground);
    border-radius: var(--radius-sm);
  }
  .dropdown-item:hover {
    background: var(--color-surface-active);
  }

  /* -- Skeletons -- */
  .skeleton {
    @apply rounded overflow-hidden relative;
    background: var(--color-surface-active);
  }
  .skeleton::after {
    content: "";
    @apply absolute inset-0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    animation: shimmer 1.5s infinite;
  }
  
  [data-theme='dark'] .skeleton::after {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
  }

  /* -- Kanban Board -- */
  .kanban-column {
    @apply flex flex-col gap-3 min-w-[320px] max-w-[320px] h-full;
  }
  .kanban-column-header {
    @apply flex items-center justify-between py-2 px-1 sticky top-0 bg-transparent;
  }
  .kanban-card {
    @apply relative p-4 transition-colors duration-200 cursor-grab;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }
  .kanban-card:hover {
    border-color: var(--color-border-light);
  }
  .kanban-card:active {
    cursor: grabbing;
    background: var(--color-surface-hover);
  }

  /* -- Empty States -- */
  .empty-state {
    @apply flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto;
  }
  .empty-state-icon {
    @apply flex h-16 w-16 items-center justify-center mb-6;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-foreground-tertiary);
  }
  .empty-state-title {
    @apply text-xl font-semibold mb-2;
    color: var(--color-foreground);
    letter-spacing: -0.01em;
  }
  .empty-state-description {
    @apply text-[15px] mb-8 leading-relaxed;
    color: var(--color-foreground-secondary);
  }

  /* -- Misc -- */
  .divider {
    @apply w-full h-[1px];
    background: var(--color-border);
  }
  
  .progress-bar {
    @apply h-1.5 w-full overflow-hidden rounded-full;
    background: var(--color-surface-active);
  }
  .progress-bar-fill {
    @apply h-full rounded-full transition-all duration-500 ease-out;
    background: var(--color-accent);
  }
  
  .notification-dot {
    @apply absolute top-0 right-0 w-2.5 h-2.5 rounded-full;
    background: var(--color-danger);
    border: 2px solid var(--color-surface);
  }
}
`;

const startIdx = css.indexOf('/* ==========================================================================');
const topPart = css.substring(0, startIdx);
fs.writeFileSync('src/index.css', topPart + replacement);
