import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Phone, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithEmail, signInWithGoogle } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading, TextField, PasswordField, GoogleButton, AuthDivider, SubmitButton } from '../../components/auth/AuthFields';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any) as any,
    defaultValues: { rememberMe: true },
  });

  const finishSignIn = async (rememberMe: boolean) => {
    const user = await completeFirebaseSignIn(rememberMe);
    toast.success('Welcome back!');
    navigate(user.authProvider === 'email' && !user.emailVerified ? '/verify-email' : '/dashboard');
  };

  const onSubmit = async ({ email, password, rememberMe }: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmail(email, password, rememberMe);
      await finishSignIn(rememberMe);
    } catch (error: any) {
      const msg = error?.message || 'Login failed. Please try again.';
      if (msg.includes('user-not-found')) {
        toast.error('No account found with this email.');
      } else if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        toast.error('Invalid email or password.');
      } else if (msg.includes('too-many-requests')) {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(getValues('rememberMe'));
      await finishSignIn(getValues('rememberMe'));
    } catch (error: any) {
      const msg = error?.message || 'Google sign-in failed.';
      if (msg.includes('popup-closed-by-user')) {
        toast.error('Sign-in cancelled.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Welcome back" subtitle="Sign in to organize your universe." />

      <GoogleButton onClick={() => void handleGoogleSignIn()} disabled={isLoading} />

      <Link
        to="/phone-login"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-navy-900/[0.04] hover:text-navy-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
      >
        <Phone size={16} /> Use your phone number instead
      </Link>

      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <PasswordField
            id="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-navy-900/15 accent-brand-600"
                {...register('rememberMe')}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton loading={isLoading}>
          Sign in to TaMaD
          <ArrowRight size={18} />
        </SubmitButton>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?
        <Link to="/register" className="font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
          Create one free
        </Link>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11.5px] text-slate-400 dark:text-slate-500">
        <Check size={12} /> Free forever plan · No credit card required
      </p>
    </AuthLayout>
  );
}
