import { NavLink, Outlet } from 'react-router-dom';
import { Search } from 'lucide-react';
import Sidebar from './layout/Sidebar';

export default function Layout() {
  return (
    <div className="layout text-[#1d1d1f] overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col relative z-10">
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="mx-auto flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-primary font-semibold">Task manager dashboard</p>
              <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">Organize your day with clarity</h1>
              <div className="flex flex-wrap gap-2 text-secondary text-sm font-medium">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1">AI-powered prioritization</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1">Focus mode</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative hidden lg:block">
                <input
                  type="search"
                  placeholder="Search project, task or report (Ctrl+K)"
                  className="w-80 px-4 py-2.5 rounded-lg border border-border bg-gray-50 text-[#1d1d1f] placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all pr-10"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button className="btn-primary py-2.5 px-6 w-auto">New Task</button>
              <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 border border-border shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">JD</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-[#1d1d1f]">Jade Doe</p>
                  <p className="text-xs text-secondary">Product lead</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="lg:hidden border-b border-border bg-surface px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { to: '/', label: 'Home' },
              { to: '/tasks', label: 'Tasks' },
              { to: '/calendar', label: 'Calendar' },
              { to: '/analytics', label: 'Analytics' },
              { to: '/roadmap', label: 'Roadmap' },
              { to: '/reports', label: 'Reports' },
              { to: '/notifications', label: 'Alerts' },
              { to: '/focus', label: 'Focus' },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${isActive ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-8 main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}