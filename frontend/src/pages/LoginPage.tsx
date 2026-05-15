import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 font-['Outfit'] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border border-slate-900/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -z-10 rounded-full"></div>

          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-widest mb-6"
            >
            </motion.div>


            <h1 className="text-4xl font-black tracking-tight mb-2">
              TASKFLOW<span className="text-slate-500"></span>
            </h1>
            <p className="text-slate-500 font-medium">Log in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-slate-900 placeholder:text-slate-600 font-medium"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-400 font-bold ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" weight="bold" className="text-xs text-primary-500 hover:text-primary-400 font-black transition-colors">Recover Access</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-900/[0.03] border border-slate-900/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-slate-900 placeholder:text-slate-600 font-medium"
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-400 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 btn-primary text-slate-900 rounded-2xl font-black text-lg shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : (
                <>
                  <LogIn size={20} />
                  Login
                </>
              )}
            </button>
          </form>


          <p className="mt-10 text-center text-sm text-slate-500 font-medium">
            New to the system? <Link to="/register" className="text-primary-500 hover:text-primary-400 font-black transition-colors">Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
