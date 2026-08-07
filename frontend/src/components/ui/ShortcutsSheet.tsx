import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, CornerDownLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInteractionStore } from '../../store/interactionStore';

const GOTO: Record<string, string> = {
  d: '/dashboard',
  t: '/tasks',
  c: '/calendar',
  p: '/projects',
  r: '/roadmap',
  f: '/focus',
  l: '/planner',
  n: '/notes',
  o: '/documents',
  i: '/files',
  w: '/whiteboard',
  a: '/analytics',
  e: '/reports',
  b: '/ai',
  m: '/team/members',
  s: '/settings',
};

const SECTIONS: Array<{ title: string; items: Array<[string, string]> }> = [
  {
    title: 'Navigation',
    items: [
      ['⌘ / Ctrl + K', 'Open command palette'],
      ['C', 'Quick create'],
      ['G', 'Go to a page, then press a key'],
      ['?', 'Show this menu'],
      ['Esc', 'Close overlay or inspector'],
    ],
  },
  {
    title: 'Command palette',
    items: [
      ['Type…', 'Search tasks, pages, people'],
      ['↑ / ↓', 'Move selection'],
      ['Enter', 'Open selection'],
      ['Esc', 'Close'],
    ],
  },
  {
    title: 'Quick create',
    items: [
      ['Tab / click', 'Choose what to create'],
      ['Enter', 'Save'],
      ['Esc', 'Cancel'],
    ],
  },
  {
    title: 'Go to (press G, then)',
    items: [
      ['G then D', 'Dashboard'],
      ['G then T', 'Tasks'],
      ['G then C', 'Calendar'],
      ['G then P', 'Projects'],
      ['G then N', 'Notes'],
      ['G then A', 'Analytics'],
    ],
  },
];

export function ShortcutsSheet() {
  const open = useInteractionStore((s) => s.shortcutsSheetOpen);
  const close = useInteractionStore((s) => s.toggleShortcutsSheet);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[76] flex items-start justify-center bg-black/40 p-4 pt-[14vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-[var(--shadow-float)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--color-accent-ghost)', color: 'var(--color-accent)' }}>
                <Keyboard size={17} />
              </span>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-[color:var(--color-foreground)]">Keyboard shortcuts</h2>
                <p className="text-xs font-medium text-[color:var(--color-muted)]">Move at the speed of thought</p>
              </div>
              <button onClick={close} className="rounded-lg p-1.5 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-active)]" aria-label="Close shortcuts">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin' }}>
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[color:var(--color-foreground-tertiary)]">{section.title}</p>
                  <div className="space-y-1.5">
                    {section.items.map(([keys, desc]) => (
                      <div key={keys} className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium text-[color:var(--color-foreground-secondary)]">{desc}</span>
                        <span className="shrink-0 text-[11px] font-bold text-[color:var(--color-foreground)]">
                          {keys.split(' then ').map((part, i) => (
                            <React.Fragment key={part}>
                              {i > 0 && <span className="mx-1 text-[color:var(--color-muted)]">then</span>}
                              {part.split(' / ').map((k, j) => (
                                <React.Fragment key={k}>
                                  {j > 0 && <span className="mx-0.5 text-[color:var(--color-muted)]">/</span>}
                                  <kbd className="kbd-hint">{k}</kbd>
                                </React.Fragment>
                              ))}
                            </React.Fragment>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-border bg-background-secondary/60 px-5 py-2.5 text-[10px] font-semibold text-[color:var(--color-foreground-tertiary)]">
              <CornerDownLeft size={10} />
              Press <kbd className="kbd-hint">?</kbd> any time to reopen
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GNavHud() {
  const navigate = useNavigate();
  const gNavKey = useInteractionStore((s) => s.gNavKey);
  const setGNavKey = useInteractionStore((s) => s.setGNavKey);

  const pick = (key: string) => {
    setGNavKey(null);
    const target = GOTO[key];
    if (target) navigate(target);
  };

  return (
    <AnimatePresence>
      {gNavKey === 'g' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed bottom-6 left-1/2 z-[77] -translate-x-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/95 px-5 py-3.5 shadow-[var(--shadow-float)] backdrop-blur-2xl">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[color:var(--color-muted)]">
              <kbd className="kbd-hint" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent-ghost)' }}>G</kbd> Go to
            </span>
            <div className="flex items-center gap-1.5">
              {Object.entries(GOTO).slice(0, 12).map(([key, path]) => (
                <button
                  key={key}
                  onClick={() => pick(key)}
                  onMouseEnter={() => undefined}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-[color:var(--color-foreground-secondary)] transition-colors hover:bg-[color:var(--color-accent-ghost)] hover:text-[color:var(--color-accent)]"
                  title={path}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ShortcutsSheet;
