import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerWithEmail } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const completeFirebaseSignIn = useAuthStore((state) => state.completeFirebaseSignIn);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ({ name, email, password }: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerWithEmail(name, email, password);
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-md">
            <span className="text-white text-4xl font-bold tracking-tighter">TM</span>
          </div>
          <h1 className="auth-card-title">Create Account</h1>
          <p className="auth-card-subtitle">Join TaMaD for a better workflow</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Full Name</label>
            <input
              {...register('name')}
              className="input-field"
              placeholder="John Doe"
              autoComplete="name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500 font-medium">{errors.name.message}</p>}
          </div>

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
                autoComplete="new-password"
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

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className="input-field"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
            )}
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
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-hover transition-colors ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
