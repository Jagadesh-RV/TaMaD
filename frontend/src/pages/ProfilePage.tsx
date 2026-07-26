import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  Shield,
  Globe,
  Monitor,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Pencil,
  Key,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';

const MOCK_SESSIONS = [
  {
    deviceName: 'MacBook Pro — Chrome',
    ipAddress: '192.168.1.42',
    lastUsedAt: 'Active now',
    isCurrent: true,
  },
  {
    deviceName: 'iPhone 15 Pro — Safari',
    ipAddress: '192.168.1.88',
    lastUsedAt: '2 hours ago',
    isCurrent: false,
  },
  {
    deviceName: 'iPad Air — Safari',
    ipAddress: '10.0.0.15',
    lastUsedAt: '3 days ago',
    isCurrent: false,
  },
];

const STATS = [
  { label: 'Tasks Completed', value: '24', sublabel: 'This month' },
  { label: 'Active Projects', value: '4', sublabel: 'In progress' },
  { label: 'Member Since', value: 'Jan 2025', sublabel: '18 months' },
  { label: 'Focus Score', value: '87%', sublabel: 'Above average' },
];

export default function ProfilePage() {
  const { user, init, loading, logout } = useAuthStore((state) => ({
    user: state.user,
    init: state.init,
    loading: state.loading,
    logout: state.logout,
  }));
  const { isDark, toggleTheme } = useTheme();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    void init();
  }, [init]);

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
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex items-center gap-3">
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
              </div>
              <p
                className="mt-1 text-sm"
                style={{ color: 'var(--color-muted)' }}
              >
                {user.email}
              </p>
            </div>
            <div className="flex gap-2 pb-1">
              <button className="btn btn-secondary btn-sm">
                <Pencil size={14} />
                Edit
              </button>
              <button
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
        {STATS.map((stat, i) => (
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
            <p
              className="mt-0.5 text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              {stat.sublabel}
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
            <button className="btn btn-ghost btn-sm">
              <Key size={14} />
              Manage
            </button>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-3">
              {MOCK_SESSIONS.map((session) => (
                <div
                  key={session.deviceName}
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
                    {session.deviceName.includes('iPhone') ||
                    session.deviceName.includes('iPad') ? (
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
                          {session.deviceName}
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
                        {session.ipAddress} &middot; {session.lastUsedAt}
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
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="input"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="input"
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
