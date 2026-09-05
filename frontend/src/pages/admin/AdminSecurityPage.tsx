import { useEffect } from 'react';
import { 
  ShieldAlert, Activity, FileText, Globe 
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { format } from 'date-fns';

export default function AdminSecurityPage() {
  const { auditLogs, auditLogsLoading, fetchAuditLogs } = useAdminStore();

  useEffect(() => {
    fetchAuditLogs(1, 50);
  }, [fetchAuditLogs]);

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            Security & Audit
          </h1>
          <p className="mt-1 text-sm text-slate-400">Immutable ledger of all platform administrative actions.</p>
        </div>
      </header>

      <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Admin</th>
                <th className="px-6 py-4 font-semibold">Resource</th>
                <th className="px-6 py-4 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {auditLogsLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                auditLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-indigo-400" />
                        <span className="font-medium text-slate-200">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{log.adminId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{log.adminId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-slate-500" />
                        <span>{log.resourceType}</span>
                        {log.resourceId && <span className="text-slate-500 ml-1">({log.resourceId.slice(-6)})</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Globe size={14} />
                        {log.ipAddress}
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
