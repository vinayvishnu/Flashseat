import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { Lock, Mail, User as UserIcon, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletBalance, setWalletBalance] = useState(15000);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        setError(resData.error || 'Registration failed');
        return;
      }

      const userData = resData.data;
      dispatch(loginSuccess({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role.toLowerCase(),
        token: userData.token,
        walletBalance,
        bookingLimit: 4,
      }));
      navigate('/dashboard');
    } catch (err) {
      setError('Connection refused: Make sure your server is running.');
    }
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
            Register New Account
          </h2>
          <p className="mt-2 text-sm text-foreground/60">
            Create your FlashSeat AI ticketing profile
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
              <label className="text-sm font-semibold text-foreground/75 mb-1.5 block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  placeholder="Vinay Kumar"
                />
              </div>
            </div>

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

            {/* Simulated Funding Slider */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide flex items-center gap-1">
                  <Wallet className="h-4 w-4 text-accent" />
                  <span>Funding Simulation</span>
                </label>
                <span className="text-sm font-bold text-accent">₹{walletBalance.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="5000"
                value={walletBalance}
                onChange={(e) => setWalletBalance(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-[10px] text-foreground/45 mt-1 block">Set your simulated wallet budget to test purchasing.</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-lg shadow-primary/20 transition-all font-display font-semibold"
          >
            Create & Authenticate Account
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary hover:text-secondary-hover font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
export default Register;
