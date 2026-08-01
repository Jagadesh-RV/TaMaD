import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building2, Check, PartyPopper, Rocket, Sparkles, User } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useOrganizationStore } from '../store/organizationStore';
import { AuthLayout } from '../components/auth/AuthLayout';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createOrganization = useOrganizationStore((state) => state.createOrganization);

  const [mode, setMode] = useState<'personal' | 'team' | null>(null);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!user) return <Navigate to="/register" replace />;

  const firstName = (user.name || 'there').split(' ')[0];

  const skip = async () => {
    setIsDone(true);
  };

  const finish = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const org = await createOrganization({
        name: name.trim(),
        ...(domain.trim() ? { domain: domain.trim() } : {}),
      });
      if (org?._id) {
        useOrganizationStore.getState().setCurrentOrganization(org);
      }
      toast.success('Your workspace is ready!');
      setIsDone(true);
    } catch (error: any) {
      toast.error(error.message || 'Unable to create your workspace. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_20px_50px_-16px_rgba(37,99,235,0.55)]"
            >
              <PartyPopper size={36} />
            </motion.div>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-navy-950 dark:text-white">
              You're all set, {firstName}!
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Your workspace is ready. Start with your dashboard, create your first task, and watch TaMaD bring it all together.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500"
            >
              <Rocket size={18} />
              Open my dashboard
            </button>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">You can invite teammates anytime from your workspace settings.</p>
          </motion.div>
        ) : mode === null ? (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                <Sparkles size={26} />
              </div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-navy-950 dark:text-white">
                Welcome to TaMaD, {firstName}
              </h1>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">Let's set up your workspace in a few seconds.</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMode('personal')}
                className="group flex w-full items-center gap-4 rounded-2xl border border-navy-900/10 bg-white/70 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[0_16px_40px_-20px_rgba(37,99,235,0.3)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-400/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <User size={20} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-navy-950 dark:text-white">Just me</span>
                  <span className="block text-[13px] text-slate-500 dark:text-slate-400">A personal workspace for my own tasks, notes, goals and focus.</span>
                </span>
                <ArrowRight size={18} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500 dark:text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => setMode('team')}
                className="group flex w-full items-center gap-4 rounded-2xl border border-navy-900/10 bg-white/70 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[0_16px_40px_-20px_rgba(37,99,235,0.3)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-400/30"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <Building2 size={20} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-navy-950 dark:text-white">My team</span>
                  <span className="block text-[13px] text-slate-500 dark:text-slate-400">An organization workspace for projects, sprints, meetings and collaboration.</span>
                </span>
                <ArrowRight size={18} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500 dark:text-slate-600" />
              </button>
            </div>

            <button type="button" onClick={() => void skip()} className="mt-6 w-full text-center text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              Skip for now
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-8 text-center">
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-navy-950 dark:text-white">
                {mode === 'team' ? 'Name your workspace' : 'Name your workspace'}
              </h1>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">
                {mode === 'team' ? "Your team's shared home for everything TaMaD." : "Your personal command center."}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void finish();
              }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="wsName" className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
                  {mode === 'team' ? 'Organization name' : 'Workspace name'}
                </label>
                <input
                  id="wsName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  placeholder={mode === 'team' ? 'Acme Inc.' : "My personal workspace"}
                  className={clsx(
                    'h-12 w-full rounded-xl border bg-white/70 px-4 text-[14px] font-medium text-navy-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:bg-white/[0.04] dark:text-white',
                    'border-navy-900/10 hover:border-navy-900/20 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:hover:border-white/20',
                  )}
                />
              </div>

              {mode === 'team' && (
                <div>
                  <label htmlFor="wsDomain" className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
                    Workspace URL (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="pointer-events-none absolute ml-4 text-sm text-slate-400">tamad.app/</span>
                    <input
                      id="wsDomain"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                      placeholder="acme"
                      className={clsx(
                        'h-12 w-full rounded-xl border bg-white/70 pl-[92px] pr-4 text-[14px] font-medium text-navy-900 outline-none transition-all duration-200 placeholder:text-slate-400 dark:bg-white/[0.04] dark:text-white',
                        'border-navy-900/10 hover:border-navy-900/20 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:hover:border-white/20',
                      )}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">You can change this later.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Create workspace
                  </>
                )}
              </button>

              <button type="button" onClick={() => void skip()} className="w-full text-center text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                Skip for now
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
