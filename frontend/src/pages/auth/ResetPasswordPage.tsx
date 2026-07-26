import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetFirebasePassword } from '../../services/firebase';

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }: Values) => {
    const code = params.get('oobCode');
    if (!code) return toast.error('This reset link is invalid or expired.');
    try {
      await resetFirebasePassword(code, password);
      setComplete(true);
      toast.success('Password updated.');
    } catch (error: any) {
      toast.error(error.message || 'This reset link is invalid or expired.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <Lock className="text-blue-600" size={32} />
          </div>
          <h1 className="auth-card-title">Reset Password</h1>
          <p className="auth-card-subtitle">Choose a new, strong password for your account.</p>
        </div>

        {complete ? (
          <div className="auth-confirmation">
            <p>Your password has been updated.</p>
            <Link to="/login" className="auth-text-button">
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : null}
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
