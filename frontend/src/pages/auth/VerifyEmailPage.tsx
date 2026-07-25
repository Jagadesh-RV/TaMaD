import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClientAuth, resendVerificationEmail } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const [isSending, setIsSending] = useState(false);
  const resend = async () => { setIsSending(true); try { await resendVerificationEmail(); toast.success('Verification email sent.'); } catch (error: any) { toast.error(error.message || 'Unable to send verification email.'); } finally { setIsSending(false); } };
  const continueToDashboard = async () => { try { await getClientAuth().currentUser?.reload(); const user = await completeFirebaseSignIn(false); if (!user.emailVerified) return toast.error('Your email is not verified yet.'); navigate('/'); } catch (error: any) { toast.error(error.message || 'Unable to refresh verification status.'); } };
  return <div className="auth-page"><div className="auth-card auth-verification-card"><div className="text-center mb-10"><h1 className="auth-card-title">Verify your email</h1><p className="auth-card-subtitle">We sent a verification link to your inbox. Verify it, then continue.</p></div><button type="button" onClick={continueToDashboard} className="btn-primary">I’ve verified my email</button><button type="button" onClick={resend} disabled={isSending} className="auth-text-button">{isSending ? 'Sending…' : 'Resend verification email'}</button><Link to="/login" className="auth-back-link">Back to Login</Link></div></div>;
}
