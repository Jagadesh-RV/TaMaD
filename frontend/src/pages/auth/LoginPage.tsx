import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithEmail, signInWithGoogle } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { rememberMe: true },
  });

  const finishSignIn = async (rememberMe: boolean) => {
    const user = await completeFirebaseSignIn(rememberMe);
    toast.success('Welcome back!');
    navigate(user.authProvider === 'email' && !user.emailVerified ? '/verify-email' : '/');
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-md">
            <span className="text-white text-4xl font-bold tracking-tighter">TM</span>
          </div>
          <h1 className="auth-card-title">Welcome Back</h1>
          <p className="auth-card-subtitle">Sign in to organize your universe</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="btn-secondary auth-provider-button"
        >
          <span className="auth-google-mark">G</span> Continue with Google
        </button>

        <Link to="/phone-login" className="auth-phone-link">
          Use your phone number instead
        </Link>

        <div className="auth-divider"><span>or continue with email</span></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
            <input
              {...register('email')}
              type="email"
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 bg-white text-primary focus:ring-primary focus:ring-offset-background mr-3 cursor-pointer"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-4 flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                Sign In to TaMaD
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary-hover transition-colors ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
