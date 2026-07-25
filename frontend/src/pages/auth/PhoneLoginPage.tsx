import { useEffect, useRef, useState } from 'react';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createPhoneRecaptcha, startPhoneSignIn } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

const countryCodes = [
  { code: '+1', label: 'US/CA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+91', label: 'India (+91)' },
  { code: '+81', label: 'Japan (+81)' },
];

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
    const timer = window.setTimeout(() => setSecondsRemaining((value) => value - 1), 1000);
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
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'The verification code is invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <h1 className="auth-card-title">Sign in with phone</h1>
          <p className="auth-card-subtitle">We’ll send a one-time verification code.</p>
        </div>
        {!confirmation ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Phone Number</label>
              <div className="auth-phone-input-group">
                <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="input-field auth-country-code" aria-label="Country code">
                  {countryCodes.map(({ code: value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="input-field" placeholder="5551234567" autoComplete="tel-national" inputMode="tel" />
              </div>
            </div>
            <div ref={captchaContainer} className="auth-captcha" />
            <button type="button" onClick={sendCode} disabled={isLoading} className="btn-primary">{isLoading ? 'Sending…' : 'Send OTP'}</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Verification Code</label>
              <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="input-field auth-otp-input" inputMode="numeric" maxLength={6} placeholder="123456" />
            </div>
            <button type="button" onClick={verifyCode} disabled={isLoading || code.length !== 6} className="btn-primary">{isLoading ? 'Verifying…' : 'Verify and Sign In'}</button>
            <button type="button" onClick={sendCode} disabled={isLoading || secondsRemaining > 0} className="auth-text-button">{secondsRemaining ? `Resend code in ${secondsRemaining}s` : 'Resend code'}</button>
          </div>
        )}
        <div className="mt-8 text-center"><Link to="/login" className="font-semibold text-gray-600 hover:text-gray-900 transition-colors">Back to Login</Link></div>
      </div>
    </div>
  );
}
