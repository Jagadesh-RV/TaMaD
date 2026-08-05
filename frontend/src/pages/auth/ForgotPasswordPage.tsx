import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendResetEmail } from '../../services/firebase';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading, TextField, SubmitButton } from '../../components/auth/AuthFields';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema as any) as any });

  const onSubmit = async ({ email }: Values) => {
    setIsLoading(true);
    try {
      await sendResetEmail(email);
      setIsSent(true);
      toast.success('Reset email sent.');
    } catch (error: any) {
      toast.error(error.message || 'Unable to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Forgot your password?" subtitle="No problem — we'll send you a secure reset link." />

      {isSent ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <MailCheck size={30} />
          </div>
          <h2 className="text-lg font-extrabold text-navy-950 dark:text-white">Check your inbox</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            We&apos;ve sent a password reset link. If it doesn&apos;t arrive within a few minutes, check your spam folder.
          </p>
          <button
            type="button"
            onClick={() => setIsSent(false)}
            className="mt-6 text-sm font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Mail size={18} className="pointer-events-none absolute left-4 top-[38px] -translate-y-1/2 text-slate-400" />
            <TextField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-11"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <SubmitButton loading={isLoading}>{isLoading ? 'Sending...' : 'Send reset link'}</SubmitButton>
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
