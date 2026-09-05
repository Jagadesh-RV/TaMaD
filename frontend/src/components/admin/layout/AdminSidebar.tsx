import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, Zap, 
  Activity, ShieldAlert, LogOut, Settings, 
  HardDrive
} from 'lucide-react';
import { useAdminAuthStore } from '../../../store/adminAuthStore';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useAdminAuthStore(s => s.logout);
  const admin = useAdminAuthStore(s => s.admin);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Organizations', path: '/admin/organizations', icon: Building2 },
    { label: 'AI & Automations', path: '/admin/controls', icon: Zap },
    { label: 'Storage', path: '/admin/storage', icon: HardDrive },
    { label: 'System Health', path: '/admin/health', icon: Activity },
    { label: 'Security & Audit', path: '/admin/security', icon: ShieldAlert },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white font-bold">
            T
          </div>
          <span className="font-semibold tracking-wide">TaMaD Admin</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 px-2">
          <p className="text-sm font-medium text-slate-300">{admin?.name}</p>
          <p className="text-xs text-slate-500 uppercase mt-0.5">{admin?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
