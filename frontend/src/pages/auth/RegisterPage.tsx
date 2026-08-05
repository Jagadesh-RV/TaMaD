import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { registerWithEmail } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthHeading, TextField, PasswordField, SubmitButton } from '../../components/auth/AuthFields';

const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/\d/, 'Include a number');

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const requirements = [
  { key: 'length', label: '8+ characters' },
  { key: 'upper', label: 'Uppercase' },
  { key: 'lower', label: 'Lowercase' },
  { key: 'digit', label: 'Number' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any) as any,
  });

  const met = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
  };

  const onSubmit = async ({ name, email, password: pw }: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerWithEmail(name, email, pw);
      await completeFirebaseSignIn(false);
      toast.success('Account created! Check your email to verify it.');
      navigate('/verify-email');
    } catch (error: any) {
      const msg = error?.message || 'Registration failed.';
      if (msg.includes('email-already-in-use')) {
        toast.error('An account with this email already exists. Try signing in.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout wide>
      <div className="mx-auto w-full max-w-md">
        <AuthHeading
          title="Create your account"
          subtitle="Start free forever — no credit card required."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextField
            id="name"
            label="Full Name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <TextField
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            id="password"
            label="Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', { onChange: (e) => setPassword(e.target.value) })}
          />

          <div className="flex flex-wrap gap-2">
            {requirements.map((req) => {
              const done = met[req.key as keyof typeof met];
              return (
                <span
                  key={req.key}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200',
                    done
                      ? 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-300'
                      : 'border-navy-900/10 text-slate-400 dark:border-white/10 dark:text-slate-500',
                  )}
                >
                  <span className={clsx('flex h-3.5 w-3.5 items-center justify-center rounded-full', done ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/10')}>
                    {done && <Check size={9} strokeWidth={3.5} />}
                  </span>
                  {req.label}
                </span>
              );
            })}
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <p className="text-[11.5px] leading-relaxed text-slate-400 dark:text-slate-500">
            By creating an account, you agree to TaMaD&apos;s Terms of Service and acknowledge the Privacy Policy.
          </p>

          <SubmitButton loading={isLoading}>
            Create account
            <ArrowRight size={18} />
          </SubmitButton>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-navy-900/[0.07] pt-7 text-sm text-slate-500 dark:border-white/[0.08] dark:text-slate-400">
          Already have an account?
          <Link to="/login" className="font-bold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
