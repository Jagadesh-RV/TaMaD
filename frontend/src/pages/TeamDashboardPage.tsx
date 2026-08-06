import { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useDashboardStore } from '../store/dashboardStore';
import DashboardWidgetEngine from '../components/dashboard/DashboardWidgetEngine';
import { Settings, Save, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function TeamDashboardPage() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace);
  const { dashboard, fetchDashboard, updateLayout, saveDashboard, loading } = useDashboardStore();
  
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchDashboard(currentWorkspace._id);
    }
  }, [currentWorkspace?._id]);

  if (!currentWorkspace) return null;
  if (loading) return <div className="p-8 text-[color:var(--color-muted)]">Loading dashboard...</div>;
  if (!dashboard) return <div className="p-8 text-[color:var(--color-muted)]">No dashboard configured.</div>;

  const handleSave = async () => {
    await saveDashboard();
    setIsEditing(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[color:var(--color-background)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-8 py-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--color-foreground)]">{dashboard.name}</h1>
          <p className="mt-2 text-sm font-medium text-[color:var(--color-foreground-secondary)]">
            Command center for {currentWorkspace.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)} className="rounded-xl px-5">
                <X size={16} className="mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="rounded-xl px-5 shadow-sm">
                <Save size={16} className="mr-2" /> Save Layout
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)} className="rounded-xl px-5">
              <Settings size={16} className="mr-2" /> Customize
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <DashboardWidgetEngine 
          layout={dashboard.layout} 
          onChange={updateLayout}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}
