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
      <div className="flex items-center justify-between border-b p-6" style={{ borderColor: 'var(--color-border-light)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{dashboard.name}</h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Command center for {currentWorkspace.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                <X size={16} className="mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" /> Save Layout
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
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
