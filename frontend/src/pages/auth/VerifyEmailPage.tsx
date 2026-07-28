import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getClientAuth, resendVerificationEmail } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

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
      navigate('/');
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="auth-card-title">Verify your email</h1>
          <p className="auth-card-subtitle">
            We sent a verification link to your inbox. Click it, then come back and press the button below.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={checkVerification}
            disabled={isChecking}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {isChecking ? 'Checking...' : "I've verified my email"}
          </button>

          <div className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
            Auto-checking in {countdown}s
          </div>

          <button
            type="button"
            onClick={resend}
            disabled={isSending}
            className="auth-text-button flex items-center justify-center gap-2"
          >
            {isSending ? <Loader2 className="animate-spin" size={16} /> : null}
            {isSending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
