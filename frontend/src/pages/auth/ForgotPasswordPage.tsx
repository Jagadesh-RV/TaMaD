import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendResetEmail } from '../../services/firebase';

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
  } = useForm<Values>({ resolver: zodResolver(schema) });

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
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h1 className="auth-card-title">Forgot Password</h1>
          <p className="auth-card-subtitle">
            Enter your email and we'll send a secure reset link.
          </p>
        </div>

        {isSent ? (
          <div className="auth-confirmation">
            <p className="text-sm leading-relaxed">
              Check your inbox and spam folder for your password reset link.
            </p>
            <button
              type="button"
              onClick={() => setIsSent(false)}
              className="auth-text-button"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
