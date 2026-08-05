import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClientAuth, resendVerificationEmail } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading } from '../../components/auth/AuthFields';

const AUTO_CHECK_INTERVAL = 10;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const syncEmailVerification = useAuthStore((state) => state.syncEmailVerification);
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_CHECK_INTERVAL);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkVerification = useCallback(async () => {
    setIsChecking(true);
    try {
      await getClientAuth().currentUser?.reload();
      const user = await syncEmailVerification();
      if (!user.emailVerified) {
        toast.error('Your email is not verified yet. Please click the link in your email first.');
        return;
      }
      toast.success('Email verified!');
      navigate('/onboarding');
    } catch (error: any) {
      toast.error(error.message || 'Unable to check verification status.');
    } finally {
      setIsChecking(false);
    }
  }, [syncEmailVerification, navigate]);

  const resend = async () => {
    setIsSending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Unable to send verification email.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkVerification();
          return AUTO_CHECK_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkVerification]);

  return (
    <AuthLayout>
      <AuthHeading title="Verify your email" subtitle="One last step before you can organize your universe." />

      <div className="rounded-3xl border border-brand-500/20 bg-brand-500/[0.05] p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)]">
          <Mail size={30} />
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          We sent a verification link to your inbox. Click it, then come back — we&apos;ll check automatically every{' '}
          <strong className="font-bold text-navy-950 dark:text-white">{countdown}s</strong>.
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={checkVerification}
            disabled={isChecking}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isChecking ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {isChecking ? 'Checking...' : "I've verified my email"}
          </button>

          <button
            type="button"
            onClick={resend}
            disabled={isSending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-500/[0.06] disabled:cursor-not-allowed disabled:opacity-60 dark:text-brand-300"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {isSending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900 dark:text-slate-400 dark:hover:text-white">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
