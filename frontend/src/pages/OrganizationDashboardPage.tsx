import { useEffect } from 'react';
import { useOrganizationStore } from '../store/organizationStore';
import { Building, Users, CreditCard, Settings, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function OrganizationDashboardPage() {
  const { id } = useParams();
  const { organizations, fetchOrganizations, setCurrentOrganization, currentOrganization } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (id && organizations.length > 0) {
      const org = organizations.find((o) => o._id === id);
      if (org) setCurrentOrganization(org);
    }
  }, [id, organizations, setCurrentOrganization]);

  if (!currentOrganization) return <div className="p-8">Loading Organization...</div>;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b p-8" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-500 text-white">
            <Building size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {currentOrganization.name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Organization Dashboard • {currentOrganization.domain || 'No domain configured'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Quick Stat Cards */}
          <div className="rounded-xl border p-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 text-purple-500 mb-2">
              <Users size={20} />
              <h3 className="font-semibold text-[color:var(--color-foreground)]">Total Members</h3>
            </div>
            <p className="text-3xl font-bold">{currentOrganization.members.length}</p>
          </div>

          <div className="rounded-xl border p-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3 text-[color:var(--color-success)] mb-2">
              <CreditCard size={20} />
              <h3 className="font-semibold text-[color:var(--color-foreground)]">Billing Plan</h3>
            </div>
            <p className="text-xl font-bold capitalize">{currentOrganization.billing?.plan || 'Free'}</p>
            <p className="text-xs text-[color:var(--color-muted)] mt-1">Status: {currentOrganization.billing?.status || 'Active'}</p>
          </div>

          <div className="rounded-xl border p-6 md:col-span-2 flex flex-col justify-center items-center text-center opacity-50" style={{ background: 'var(--color-surface-hover)', borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">Organization Analytics</h3>
            <p className="text-sm text-[color:var(--color-muted)]">Cross-team analytics coming soon.</p>
          </div>
        </div>

        {/* Global Members */}
        <div className="rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between border-b p-6" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>Global Members</h2>
            <button className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
              <Plus size={16} /> Invite Member
            </button>
          </div>
          <div className="p-6">
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {currentOrganization.members.map((member: any) => (
                <div key={member.userId?._id || member.userId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-xs text-white">
                      {member.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{member.userId?.name || 'Unknown User'}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{member.userId?.email}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-1 text-xs font-medium bg-[color:var(--color-surface-hover)] text-[color:var(--color-muted)] uppercase">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
