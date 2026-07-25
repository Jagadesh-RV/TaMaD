import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetFirebasePassword } from '../../services/firebase';

const schema = z.object({ password: z.string().min(8, 'Use at least 8 characters'), confirmPassword: z.string() }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [complete, setComplete] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const onSubmit = async ({ password }: Values) => { const code = params.get('oobCode'); if (!code) return toast.error('This reset link is invalid or expired.'); try { await resetFirebasePassword(code, password); setComplete(true); toast.success('Password updated.'); } catch (error: any) { toast.error(error.message || 'This reset link is invalid or expired.'); } };
  return <div className="auth-page"><div className="auth-card"><div className="text-center mb-10"><h1 className="auth-card-title">Reset Password</h1><p className="auth-card-subtitle">Choose a new, strong password for your account.</p></div>{complete ? <div className="auth-confirmation"><p>Your password has been updated.</p><Link to="/login" className="auth-text-button">Sign in</Link></div> : <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"><div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">New Password</label><input {...register('password')} type="password" className="input-field" autoComplete="new-password" />{errors.password && <p className="mt-1 text-sm text-red-500 font-medium">{errors.password.message}</p>}</div><div><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Confirm Password</label><input {...register('confirmPassword')} type="password" className="input-field" autoComplete="new-password" />{errors.confirmPassword && <p className="mt-1 text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>}</div><button disabled={isSubmitting} className="btn-primary">Update Password</button></form>}</div></div>;
}
