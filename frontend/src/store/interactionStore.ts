import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentItem {
  id: string;
  type: 'page' | 'task' | 'project' | 'note' | 'document' | 'member' | 'meeting';
  label: string;
  href: string;
  icon: string;
  ts: number;
}

export interface InspectorTarget {
  type: string;
  id: string;
}

interface InteractionState {
  commandPaletteOpen: boolean;
  quickCreateOpen: boolean;
  quickCreateIntent: string | null;
  shortcutsSheetOpen: boolean;
  inspector: InspectorTarget | null;
  recents: RecentItem[];
  pinned: string[];
  recentSearches: string[];
  gNavKey: string | null;

  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openQuickCreate: (intent?: string) => void;
  closeQuickCreate: () => void;
  toggleShortcutsSheet: () => void;
  openInspector: (type: string, id: string) => void;
  closeInspector: () => void;
  recordVisit: (item: Omit<RecentItem, 'ts'>) => void;
  togglePin: (href: string) => void;
  pushRecentSearch: (q: string) => void;
  setGNavKey: (key: string | null) => void;
}

const MAX_RECENTS = 8;
const MAX_RECENT_SEARCHES = 5;

export const useInteractionStore = create<InteractionState>()(
  persist(
    (set, get) => ({
      commandPaletteOpen: false,
      quickCreateOpen: false,
      quickCreateIntent: null,
      shortcutsSheetOpen: false,
      inspector: null,
      recents: [],
      pinned: [],
      recentSearches: [],
      gNavKey: null,

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      openQuickCreate: (intent = null) => set({ quickCreateOpen: true, quickCreateIntent: intent }),
      closeQuickCreate: () => set({ quickCreateOpen: false, quickCreateIntent: null }),
      toggleShortcutsSheet: () =>
        set((s) => ({ shortcutsSheetOpen: !s.shortcutsSheetOpen })),

      openInspector: (type, id) => set({ inspector: { type, id } }),
      closeInspector: () => set({ inspector: null }),

      recordVisit: (item) =>
        set((s) => {
          const { ts } = { ts: Date.now() };
          const recents = [
            { ...item, ts },
            ...s.recents.filter((r) => !(r.type === item.type && r.href === item.href)),
          ].slice(0, MAX_RECENTS);
          return { recents };
        }),

      togglePin: (href) =>
        set((s) => ({
          pinned: s.pinned.includes(href)
            ? s.pinned.filter((p) => p !== href)
            : [...s.pinned, href],
        })),

      pushRecentSearch: (q) =>
        set((s) => ({
          recentSearches: [
            q,
            ...s.recentSearches.filter((p) => p.toLowerCase() !== q.toLowerCase()),
          ].slice(0, MAX_RECENT_SEARCHES),
        })),

      setGNavKey: (key) => set({ gNavKey: key }),
    }),
    {
      name: 'tamad-interaction',
      partialize: (s) => ({
        recents: s.recents,
        pinned: s.pinned,
        recentSearches: s.recentSearches,
      }),
    },
  ),
);

export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const el = target;
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable ||
    el.closest('[contenteditable="true"]') !== null
  );
};
