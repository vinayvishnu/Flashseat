import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateProfile, updateWallet } from '../../store/authSlice';
import { User, Mail, Wallet, Shield, Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState(user?.name || '');
  const [isSaved, setIsSaved] = useState(false);
  const [fundAmount, setFundAmount] = useState('5000');
  const [fundSuccess, setFundSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    dispatch(updateProfile({ name }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(fundAmount);
    if (isNaN(amt) || amt <= 0 || !user) return;
    
    dispatch(updateWallet(user.walletBalance + amt));
    setFundSuccess(true);
    setTimeout(() => setFundSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <h1 className="font-display text-3xl font-extrabold text-foreground mb-8">
        Account Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Profile Details */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <h2 className="text-lg font-bold font-display mb-4 text-gradient-primary">Personal Details</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground/75 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground/75 mb-1.5 block">Email Address (Read Only)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/40">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-foreground/40 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md shadow-primary/20 transition-all font-semibold flex items-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Changes Saved</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Ticket Booking limits rules */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <h2 className="text-lg font-bold font-display mb-4 text-gradient-accent flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <span>Anti-Scalping Regulations</span>
            </h2>
            <div className="space-y-3 text-sm text-foreground/75 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>To ensure fair allocation, each authenticated node is restricted to a maximum of <strong>{user.bookingLimit} tickets</strong> per match.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Tickets purchased are locked to the user ID and cannot be resold. Matching digital signatures will be verified at stadium gates.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>Queue bypass or bulk programmatic bookings will trigger automatic node blacklist by FlashSeat Anti-Bot AI.</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Col: Wallet Widget */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-white/5"
          >
            <h2 className="text-lg font-bold font-display mb-4 text-gradient-vip flex items-center gap-1">
              <Wallet className="h-5 w-5 text-secondary" />
              <span>Digital Wallet</span>
            </h2>
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-center">
              <span className="text-[10px] uppercase tracking-wider text-foreground/50 block font-semibold">Available Balance</span>
              <span className="text-3xl font-extrabold font-display text-foreground mt-1 block">
                ₹{user.walletBalance.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Simulated Top-up Amount</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['2000', '5000', '10000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFundAmount(val)}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        fundAmount === val
                          ? 'border-secondary bg-secondary/15 text-secondary'
                          : 'border-white/10 bg-white/5 text-foreground/75 hover:bg-white/10'
                      }`}
                    >
                      +₹{parseInt(val).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="500"
                  max="100000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  placeholder="Custom Amount"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-secondary to-pink-500 hover:opacity-95 shadow-md shadow-secondary/10 transition-all flex justify-center items-center gap-1.5"
              >
                {fundSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Funds Added Successfully</span>
                  </>
                ) : (
                  <span>Load Wallet Balance</span>
                )}
              </button>
            </form>
          </motion.div>

          {/* Device node session */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-xs text-foreground/60 leading-normal">
            <Info className="h-5 w-5 text-secondary shrink-0" />
            <div>
              <p className="font-semibold text-foreground/80 mb-0.5">Secure Active Session</p>
              <p>Node: IPL-NODE-IND-993<br />Status: Verified Secure IP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserProfile;
