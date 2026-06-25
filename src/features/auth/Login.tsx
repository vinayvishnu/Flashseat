import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Default simulation login
    dispatch(loginSuccess({
      id: 'usr-4482',
      name: 'Vinay Kumar',
      email: email,
      role: email.includes('admin') ? 'admin' : 'user',
      walletBalance: 25000,
      bookingLimit: 4,
    }));
    navigate('/dashboard');
  };

  const handleShortcutLogin = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      dispatch(loginSuccess({
        id: 'adm-007',
        name: 'Admin Controller',
        email: 'admin@flashseat.ai',
        role: 'admin',
        walletBalance: 100000,
        bookingLimit: 10,
      }));
    } else {
      dispatch(loginSuccess({
        id: 'usr-4482',
        name: 'Vinay Kumar',
        email: 'vinay@flashseat.ai',
        role: 'user',
        walletBalance: 25000,
        bookingLimit: 4,
      }));
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/80 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 glass-premium p-8 rounded-2xl relative z-10"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold text-gradient-primary">
            Sign In to FlashSeat AI
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            IPL Ticket Flash Booking Node
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground/75 mb-1.5 block">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  placeholder="vinay@flashseat.ai"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground/75 mb-1.5 block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-foreground/60 cursor-pointer">
              <input type="checkbox" className="rounded bg-white/5 border-white/10 text-primary focus:ring-0 focus:ring-offset-0" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-primary hover:text-primary-hover font-semibold transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-lg shadow-primary/20 transition-all font-display font-semibold"
          >
            Authenticate Node
          </button>
        </form>

        {/* Shortcuts for testing */}
        <div className="border-t border-white/5 pt-6 mt-6">
          <p className="text-xs text-center text-foreground/45 mb-3 uppercase tracking-widest font-semibold">
            Quick Testing Access
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShortcutLogin('user')}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground/75 hover:bg-white/10 transition-all"
            >
              <UserIcon className="h-3.5 w-3.5 text-accent" />
              <span>Login as User</span>
            </button>
            <button
              onClick={() => handleShortcutLogin('admin')}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground/75 hover:bg-white/10 transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-foreground/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary hover:text-secondary-hover font-semibold transition-colors">
            Register Node
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Login;
