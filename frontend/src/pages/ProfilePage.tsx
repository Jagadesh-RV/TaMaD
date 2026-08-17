import { useEffect, useState, useCallback } from 'react';
import {
  Mail, Phone, Shield, Globe, Monitor, Clock,
  CheckCircle2, XCircle, LogOut, Pencil, Key,
  Smartphone, Laptop, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-xl p-3"
      style={{ background: 'var(--color-surface-hover)' }}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} style={{ color: 'var(--color-muted)' }} />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-muted)' }}
        >
          {label}
        </span>
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color: valueColor || 'var(--color-foreground)' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, init, loading, logout, getSessions, updateProfile } = useAuthStore((state) => ({
    user: state.user,
    init: state.init,
    loading: state.loading,
    logout: state.logout,
    getSessions: state.getSessions,
    updateProfile: state.updateProfile,
  }));
  const { isDark, toggleTheme } = useTheme();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      loadSessions();
    }
  }, [user]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getSessions();
      setSessions(data || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [getSessions]);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name: editName.trim() });
      toast.success('Profile updated');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading || !user) {
    return (
      <div className="page" style={{ padding: '0 32px 40px' }}>
        <div className="flex items-center justify-center py-32">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2"
            style={{
              borderColor: 'var(--color-border)',
              borderTopColor: 'var(--color-accent)',
            }}
          />
        </div>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';

  const stats = [
    { label: 'Auth Provider', value: user.authProvider === 'google' ? 'Google' : user.authProvider === 'phone' ? 'Phone' : 'Email' },
    { label: 'Role', value: user.role || 'User' },
    { label: 'Member Since', value: memberSince },
    { label: 'Sessions', value: sessions.length.toString() },
  ];

  return (
    <div className="page" style={{ padding: '0 32px 40px' }}>
      {/* Header */}
      <div className="mb-8">
        <p
          className="mb-2 text-sm font-semibold uppercase tracking-[0.24em]"
          style={{ color: 'var(--color-muted)' }}
        >
          Your profile
        </p>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">
          Manage your account details and preferences.
        </p>
      </div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mb-6 overflow-hidden"
      >
        <div
          className="relative h-32"
          style={{
            background: `linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 60%, var(--color-info)))`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)',
            }}
          />
        </div>
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex items-end gap-5">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-bold text-white shadow-medium"
              style={{
                background: `linear-gradient(135deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 70%, var(--color-info)))`,
                border: '4px solid var(--color-surface)',
              }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                     <input
                       value={editName}
                       onChange={(e) => setEditName(e.target.value)}
                       className="input-field"
                       style={{ width: 200 }}
                       autoFocus
                       aria-label="Display name"
                     />
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="btn btn-primary btn-sm"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setEditName(user.name || ''); }}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      {user.name}
                    </h2>
                    <span
                      className="badge badge-accent"
                      style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {user.role}
                    </span>
                  </>
                )}
              </div>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                {user.email}
              </p>
            </div>
            <div className="flex gap-2 pb-1">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-secondary btn-sm"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-danger)' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="stat-card"
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--color-muted)' }}
            >
              {stat.label}
            </p>
            <p
              className="mt-2 text-2xl font-bold"
              style={{ color: 'var(--color-foreground)' }}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Profile Sections Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-header">
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              Personal Information
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-4">
              <InfoRow
                icon={Mail}
                label="Email"
                value={user.email || 'Not provided'}
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value={user.phoneNumber || 'Not provided'}
              />
              <InfoRow
                icon={Shield}
                label="Auth Provider"
                value={
                  user.authProvider === 'google'
                    ? 'Google'
                    : user.authProvider === 'phone'
                      ? 'Phone'
                      : 'Email'
                }
              />
              <InfoRow
                icon={user.emailVerified ? CheckCircle2 : XCircle}
                label="Email Verified"
                value={user.emailVerified ? 'Verified' : 'Not verified'}
                valueColor={
                  user.emailVerified
                    ? 'var(--color-success)'
                    : 'var(--color-danger)'
                }
              />
              <InfoRow
                icon={user.phoneVerified ? CheckCircle2 : XCircle}
                label="Phone Verified"
                value={user.phoneVerified ? 'Verified' : 'Not verified'}
                valueColor={
                  user.phoneVerified
                    ? 'var(--color-success)'
                    : 'var(--color-danger)'
                }
              />
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card"
        >
          <div className="card-header">
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              Preferences
            </h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-4">
              <InfoRow
                icon={Globe}
                label="Language"
                value={
                  user.preferences?.language
                    ? user.preferences.language.toUpperCase()
                    : 'EN'
                }
              />
              <InfoRow
                icon={Clock}
                label="Timezone"
                value={user.preferences?.timezone || 'UTC'}
              />
              <div
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: 'var(--color-surface-hover)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Monitor
                    size={18}
                    style={{ color: 'var(--color-muted)' }}
                  />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      Dark Mode
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {isDark ? 'Currently dark' : 'Currently light'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative h-7 w-12 rounded-full transition-colors"
                  style={{
                    background: isDark
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full transition-transform"
                    style={{
                      background: 'white',
                      transform: isDark ? 'translateX(20px)' : 'translateX(0)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2"
        >
          <div className="card-header">
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              Active Sessions
            </h3>
            <button
              onClick={loadSessions}
              className="btn btn-ghost btn-sm"
            >
              Refresh
            </button>
          </div>
          <div className="card-body">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                No active sessions found.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((session, index) => (
                  <div
                    key={`${session.deviceName}-${index}`}
                    className="flex items-center justify-between rounded-xl p-3 transition-colors"
                    style={{
                      background: session.isCurrent
                        ? 'var(--color-accent-light)'
                        : 'var(--color-surface-hover)',
                      border: session.isCurrent
                        ? '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)'
                        : '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {(session.deviceName || '').toLowerCase().includes('iphone') ||
                      (session.deviceName || '').toLowerCase().includes('ipad') ? (
                        <Smartphone
                          size={18}
                          style={{ color: 'var(--color-muted)' }}
                        />
                      ) : (
                        <Laptop
                          size={18}
                          style={{ color: 'var(--color-muted)' }}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-foreground)' }}
                          >
                            {session.deviceName || 'Unknown device'}
                          </p>
                          {session.isCurrent && (
                            <span
                              className="badge badge-success"
                              style={{ fontSize: '10px' }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          {session.ipAddress || 'Unknown IP'} &middot; {session.lastUsedAt ? new Date(session.lastUsedAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-danger)', fontSize: '12px' }}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card lg:col-span-2"
        >
          <div className="card-header">
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--color-foreground)' }}
            >
              Security
            </h3>
          </div>
          <div className="card-body">
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="btn btn-secondary btn-sm"
            >
              <Key size={14} />
              Change Password
            </button>
            {showChangePassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex flex-col gap-3"
              >
                 <input
                   type="password"
                   placeholder="Current password"
                   className="input"
                   aria-label="Current password"
                 />
                 <input
                   type="password"
                   placeholder="New password"
                   className="input"
                   aria-label="New password"
                 />
                 <input
                   type="password"
                   placeholder="Confirm new password"
                   className="input"
                   aria-label="Confirm new password"
                 />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Update Password
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
