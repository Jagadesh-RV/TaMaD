import { useEffect, useState } from 'react';
import { 
  Search, Filter, ShieldOff, ShieldAlert,
  MoreVertical, CheckCircle, XCircle 
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const { users, usersLoading, fetchUsers, toggleUserStatus } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers(1, 50);
  }, [fetchUsers]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage all platform users, roles, and access.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64 rounded-md border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </header>

      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                          <XCircle size={12} /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleUserStatus(user._id, !user.isActive)}
                          className={`rounded-md p-1.5 transition-colors ${user.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={user.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {user.isActive ? <ShieldOff size={16} /> : <ShieldAlert size={16} />}
                        </button>
                        <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
