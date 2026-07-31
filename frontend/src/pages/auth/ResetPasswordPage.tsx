import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetFirebasePassword } from '../../services/firebase';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading, PasswordField, SubmitButton } from '../../components/auth/AuthFields';

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema as any) as any });

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
    <AuthLayout>
      <AuthHeading title="Set a new password" subtitle="Choose a strong password to secure your account." />

      {complete ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <ShieldCheck size={30} />
          </div>
          <h2 className="text-lg font-extrabold text-navy-950 dark:text-white">Password updated</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Your password has been reset. Sign in with your new credentials.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-0.5 hover:bg-brand-500"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Lock size={18} className="pointer-events-none absolute left-4 top-[38px] -translate-y-1/2 text-slate-400" />
            <PasswordField
              id="password"
              label="New Password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="pl-11"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <SubmitButton loading={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update password'}</SubmitButton>
        </form>
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
