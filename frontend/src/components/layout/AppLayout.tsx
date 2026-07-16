import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import Sidebar from "./Sidebar";
import { CommandPalette } from "../ui/CommandPalette";

export default function AppLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="layout bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-[color:var(--color-surface)]/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">Workspace</p>
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Productivity operating system</h2>
          </div>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-[color:var(--color-surface-hover)] px-3 py-2 text-sm text-[color:var(--color-muted)]"
          >
            <Command size={16} />
            <span>Quick actions</span>
          </button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}