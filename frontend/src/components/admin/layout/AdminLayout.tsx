import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAdminAuthStore } from '../../../store/adminAuthStore';

export default function AdminLayout() {
  const isAuthenticated = useAdminAuthStore(s => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-50 font-sans">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
