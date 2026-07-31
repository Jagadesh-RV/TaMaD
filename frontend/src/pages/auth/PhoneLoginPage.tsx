import { useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { ArrowLeft, Loader2, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { createPhoneRecaptcha, startPhoneSignIn } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading, SubmitButton } from '../../components/auth/AuthFields';

const countryCodes = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+55', label: 'Brazil (+55)' },
  { code: '+86', label: 'China (+86)' },
  { code: '+82', label: 'South Korea (+82)' },
  { code: '+39', label: 'Italy (+39)' },
  { code: '+34', label: 'Spain (+34)' },
  { code: '+31', label: 'Netherlands (+31)' },
  { code: '+46', label: 'Sweden (+46)' },
  { code: '+65', label: 'Singapore (+65)' },
];

const inputClasses =
  'h-12 w-full rounded-xl border border-navy-900/10 bg-white/70 px-4 text-[14px] font-medium text-navy-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-navy-900/20 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20';

export default function PhoneLoginPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const captchaContainer = useRef<HTMLDivElement>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => () => verifier.current?.clear(), []);

  useEffect(() => {
    if (!secondsRemaining) return;
    const timer = window.setTimeout(() => setSecondsRemaining((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  const sendCode = async () => {
    const normalizedNumber = phoneNumber.replace(/\D/g, '');
    if (normalizedNumber.length < 7 || normalizedNumber.length > 14) {
      toast.error('Enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    try {
      if (!verifier.current && captchaContainer.current) {
        verifier.current = createPhoneRecaptcha(captchaContainer.current);
      }
      if (!verifier.current) throw new Error('Captcha could not be initialized');
      setConfirmation(await startPhoneSignIn(`${countryCode}${normalizedNumber}`, verifier.current));
      setSecondsRemaining(60);
      toast.success('Verification code sent.');
    } catch (error: any) {
      toast.error(error.message || 'Unable to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmation) return;
    setIsLoading(true);
    try {
      await confirmation.confirm(code);
      await completeFirebaseSignIn(true);
      toast.success('Phone number verified.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'The verification code is invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Sign in with your phone" subtitle="We'll send a one-time verification code by SMS." />

      {!confirmation ? (
        <div className="space-y-5">
          <div>
            <label htmlFor="phoneNumber" className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                id="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className={clsx(inputClasses, 'w-[124px] shrink-0 cursor-pointer')}
                aria-label="Country code"
              >
                {countryCodes.map(({ code: value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClasses}
                placeholder="5551234567"
                autoComplete="tel-national"
                inputMode="tel"
              />
            </div>
          </div>

          <div ref={captchaContainer} className="overflow-hidden rounded-2xl" />

          <button
            type="button"
            onClick={sendCode}
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
            {isLoading ? 'Sending...' : 'Send verification code'}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <label htmlFor="otpCode" className="mb-1.5 block text-[13px] font-semibold text-navy-900 dark:text-slate-200">
              Verification Code
            </label>
            <input
              id="otpCode"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={clsx(inputClasses, 'text-center text-lg font-bold tracking-[0.4em]')}
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Enter the 6-digit code we sent to your phone.</p>
          </div>

          <SubmitButton type="button" loading={isLoading} disabled={isLoading || code.length !== 6} onClick={() => void verifyCode()}>
            {isLoading ? 'Verifying...' : 'Verify and sign in'}
          </SubmitButton>

          <button
            type="button"
            onClick={sendCode}
            disabled={isLoading || secondsRemaining > 0}
            className="w-full text-center text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-brand-300 dark:hover:text-brand-200"
          >
            {secondsRemaining ? `Resend code in ${secondsRemaining}s` : 'Resend code'}
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
