import { useState } from 'react';
import { Moon, Bell, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative z-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">Workspace settings</p>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mt-2 tracking-tight">Control your experience</h1>
          <p className="text-gray-500 mt-2 max-w-2xl font-medium">Customize how TaMaD looks, notifies, and saves your progress automatically with premium controls.</p>
        </div>
        <button 
          onClick={() => toast.success('Settings saved successfully!')}
          className="btn-primary inline-flex items-center justify-center gap-2 px-6 w-auto"
        >
          <Save size={18} /> Save preferences
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="bg-white p-6 rounded-[24px] border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-gray-700 border border-gray-100">
              <Moon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f]">Appearance</h2>
              <p className="text-gray-500 text-sm font-medium">Refine the theme and UI preferences.</p>
            </div>
          </div>
          <div className="space-y-4">
            <button
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${settings.darkMode ? 'border-gray-200 bg-gray-50 text-gray-900' : 'border-border bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => toggleSetting('darkMode')}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Dark mode</span>
                <span className="text-sm font-medium">{settings.darkMode ? 'Enabled' : 'Disabled'}</span>
              </div>
            </button>
            <button
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${settings.autoSave ? 'border-gray-200 bg-gray-50 text-gray-900' : 'border-border bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => toggleSetting('autoSave')}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Auto save</span>
                <span className="text-sm font-medium">{settings.autoSave ? 'On' : 'Off'}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-gray-700 border border-gray-100">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f]">Notifications</h2>
              <p className="text-gray-500 text-sm font-medium">Control alerts for tasks and reminders.</p>
            </div>
          </div>
          <div className="space-y-4">
            <button
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${settings.notifications ? 'border-gray-200 bg-gray-50 text-gray-900' : 'border-border bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => toggleSetting('notifications')}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Push notifications</span>
                <span className="text-sm font-medium">{settings.notifications ? 'Enabled' : 'Disabled'}</span>
              </div>
            </button>
            <div className="rounded-xl border border-border bg-white p-4 text-gray-600">
              <p className="text-sm font-medium">Keep real-time alerts for new tasks, deadlines, and focus sessions. Adjust these in the app when needed.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 p-3 text-gray-700 border border-gray-100 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full bg-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f]">Account</h2>
              <p className="text-gray-500 text-sm font-medium">Profile info and data sync settings.</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="font-bold text-[#1d1d1f]">Language</p>
              <p className="text-gray-500 mt-1 font-medium">English (US)</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4">
              <p className="font-bold text-[#1d1d1f]">Backup</p>
              <p className="text-gray-500 mt-1 font-medium">Auto-sync every 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
