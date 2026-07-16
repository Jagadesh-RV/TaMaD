import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsSent(true);
      toast.success('If an account exists, reset instructions have been sent.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
            <span className="text-blue-600 text-2xl font-bold">?</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-500">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-12 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-gray-700">
              Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
