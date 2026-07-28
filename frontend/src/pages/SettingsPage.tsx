import { useState, useEffect, useCallback } from 'react';
import {
  Palette, Bell, User, Shield, Save, Moon, Sun,
  Mail, Clock, Globe, Download, Key, AlertTriangle,
  Trash2, CheckCircle2, Loader2, Monitor, Smartphone,
  Laptop, LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

type SettingsTab = 'appearance' | 'notifications' | 'account' | 'security' | 'sessions';

const TABS: { key: SettingsTab; label: string; icon: typeof Palette }[] = [
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'account', label: 'Account', icon: User },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'sessions', label: 'Sessions', icon: Monitor },
];

function ToggleSwitch({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="relative h-7 w-12 rounded-full transition-colors"
      style={{
        background: enabled ? 'var(--color-accent)' : 'var(--color-border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full transition-transform"
        style={{
          background: 'white',
          transform: enabled ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-6 rounded-xl p-4"
      style={{ background: 'var(--color-surface-hover)' }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--color-foreground)' }}
        >
          {title}
        </p>
        <p
          className="mt-0.5 text-xs"
          style={{ color: 'var(--color-muted)' }}
        >
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, init, updateProfile, changePassword, deleteAccount, logout } = useAuthStore((state) => ({
    user: state.user,
    init: state.init,
    updateProfile: state.updateProfile,
    changePassword: state.changePassword,
    deleteAccount: state.deleteAccount,
    logout: state.logout,
  }));
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    taskReminders: true,
    weeklyDigest: false,
  });

  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPw: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (user) {
      setLanguage(user.preferences?.language || 'en');
      setTimezone(user.preferences?.timezone || 'UTC');
    }
  }, [user]);

  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const { getSessions } = useAuthStore.getState();
      const data = await getSessions();
      setSessions(data || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab, fetchSessions]);

  const handleSave = async () => {
    try {
      await updateProfile({
        preferences: {
          theme: isDark ? 'dark' : 'light',
          language,
          timezone,
        },
      });
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPw) {
      toast.error('Please fill in all fields');
      return;
    }
    if (passwordForm.newPw.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPw !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.current, passwordForm.newPw);
      toast.success('Password changed successfully. Other sessions have been logged out.');
      setPasswordForm({ current: '', newPw: '', confirm: '' });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted');
      navigate('/login', { replace: true });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]"
            style={{ color: 'var(--color-muted)' }}
          >
            Workspace
          </p>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Customize how TaMaD looks, notifies, and protects your data.
          </p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          <Save size={16} />
          Save changes
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Tab Nav */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div
            className="flex flex-col gap-1 rounded-xl p-1 lg:sticky lg:top-6"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  activeTab === tab.key ? 'btn-primary' : 'btn-ghost'
                )}
                style={{ justifyContent: 'flex-start' }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card"
              >
                <div className="card-header">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    Appearance
                  </h3>
                </div>
                <div className="card-body flex flex-col gap-4">
                  <div className="rounded-xl p-4" style={{ background: 'var(--color-surface-hover)' }}>
                    <p className="mb-1 text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Theme</p>
                    <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>
                      Choose between light and dark mode for the interface.
                    </p>
                    <div className="flex gap-3">
                      {[
                        { key: 'light' as const, icon: Sun, label: 'Light', active: !isDark },
                        { key: 'dark' as const, icon: Moon, label: 'Dark', active: isDark },
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => {
                            if (
                              (option.key === 'dark' && !isDark) ||
                              (option.key === 'light' && isDark)
                            ) {
                              toggleTheme();
                            }
                          }}
                          className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all"
                          style={{
                            flex: 1,
                            background: option.active ? 'var(--color-accent-light)' : 'var(--color-surface)',
                            border: option.active ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                            color: option.active ? 'var(--color-accent)' : 'var(--color-muted)',
                          }}
                        >
                          <option.icon size={24} />
                          <span className="text-xs font-semibold">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <SettingRow title="Font Size" description="Adjust the base text size across the app.">
                    <div className="flex gap-1">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all"
                          style={{
                            background: fontSize === size ? 'var(--color-accent)' : 'var(--color-surface)',
                            color: fontSize === size ? 'white' : 'var(--color-muted)',
                            border: fontSize === size ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card"
              >
                <div className="card-header">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    Notification Preferences
                  </h3>
                </div>
                <div className="card-body flex flex-col gap-3">
                  <SettingRow title="Push Notifications" description="Receive real-time browser push notifications.">
                    <ToggleSwitch enabled={notifications.push} onToggle={() => setNotifications(p => ({ ...p, push: !p.push }))} />
                  </SettingRow>
                  <SettingRow title="Email Notifications" description="Get notified via email for important updates.">
                    <ToggleSwitch enabled={notifications.email} onToggle={() => setNotifications(p => ({ ...p, email: !p.email }))} />
                  </SettingRow>
                  <SettingRow title="Task Reminders" description="Reminders for upcoming task deadlines.">
                    <ToggleSwitch enabled={notifications.taskReminders} onToggle={() => setNotifications(p => ({ ...p, taskReminders: !p.taskReminders }))} />
                  </SettingRow>
                  <SettingRow title="Weekly Digest" description="Receive a weekly summary of your productivity.">
                    <ToggleSwitch enabled={notifications.weeklyDigest} onToggle={() => setNotifications(p => ({ ...p, weeklyDigest: !p.weeklyDigest }))} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card"
              >
                <div className="card-header">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    Account Settings
                  </h3>
                </div>
                <div className="card-body flex flex-col gap-3">
                  <SettingRow title="Language" description="Select your preferred language.">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="input"
                      style={{ width: 'auto', minWidth: 140 }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </SettingRow>
                  <SettingRow title="Timezone" description="Set your local timezone for deadlines.">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="input"
                      style={{ width: 'auto', minWidth: 180 }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Denver">Mountain (MT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col gap-6"
              >
                {/* Change Password */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      Change Password
                    </h3>
                  </div>
                  <div className="card-body flex flex-col gap-3">
                    <input
                      type="password"
                      placeholder="Current password"
                      className="input"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className="input"
                      value={passwordForm.newPw}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPw: e.target.value }))}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="input"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="btn btn-primary btn-sm"
                      >
                        {isChangingPassword ? <Loader2 className="animate-spin" size={14} /> : <Key size={14} />}
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
                      <h3 className="text-base font-semibold" style={{ color: 'var(--color-danger)' }}>
                        Danger Zone
                      </h3>
                    </div>
                  </div>
                  <div className="card-body">
                    <div
                      className="flex items-center justify-between rounded-xl p-4"
                      style={{ background: 'var(--color-danger-light)' }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                          Delete Account
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      {!deleteConfirm ? (
                        <button
                          onClick={() => setDeleteConfirm(true)}
                          className="btn btn-danger btn-sm flex-shrink-0"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      ) : (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setDeleteConfirm(false)}
                            className="btn btn-ghost btn-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="btn btn-danger btn-sm"
                          >
                            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card"
              >
                <div className="card-header">
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    Active Sessions
                  </h3>
                </div>
                <div className="card-body">
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                      No active sessions found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session: any, i: number) => (
                        <div
                          key={i}
                          className={clsx(
                            'flex items-center gap-4 rounded-xl border p-4',
                            session.isCurrent ? 'border-[var(--color-accent)]' : ''
                          )}
                          style={{
                            background: session.isCurrent ? 'var(--color-accent-light)' : 'var(--color-surface-hover)',
                            borderColor: session.isCurrent ? 'var(--color-accent)' : 'var(--color-border-light)',
                          }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: 'var(--color-surface)', color: 'var(--color-muted)' }}
                          >
                            {session.deviceName?.toLowerCase().includes('mobile') ? (
                              <Smartphone size={18} />
                            ) : session.deviceName?.toLowerCase().includes('mac') ? (
                              <Laptop size={18} />
                            ) : (
                              <Monitor size={18} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                                {session.deviceName || 'Unknown Device'}
                              </p>
                              {session.isCurrent && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={{ background: 'var(--color-accent)', color: 'white' }}
                                >
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                              IP: {session.ipAddress || 'Unknown'} · Last active: {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
