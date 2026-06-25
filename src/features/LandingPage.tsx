import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMatchesQuery } from '../services/api';
import { setSelectedMatch, setBookingStep, setQueueStatus } from '../store/bookingSlice';
import { RootState } from '../store';
import { Zap, Calendar, MapPin, Users, Flame, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

// Quick Timer utility for match countdowns
const MatchTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) return { hrs: 0, mins: 0, secs: 0 };
      return {
        hrs: Math.floor(difference / (1000 * 60 * 60)),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-1 text-xs font-bold font-display bg-white/5 border border-white/5 px-2 py-1 rounded-lg">
      <span className="text-primary">{timeLeft.hrs.toString().padStart(2, '0')}h</span>
      <span className="text-foreground/40">:</span>
      <span className="text-primary">{timeLeft.mins.toString().padStart(2, '0')}m</span>
      <span className="text-foreground/40">:</span>
      <span className="text-primary">{timeLeft.secs.toString().padStart(2, '0')}s</span>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: matches, isLoading } = useGetMatchesQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Real-time server state simulation (from admin config override if present)
  const adminMatches = useSelector((state: RootState) => state.admin.matches);
  const displayMatches = adminMatches || matches;

  const handleEnterSale = (matchId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(setSelectedMatch(matchId));
    dispatch(setQueueStatus('waiting'));
    dispatch(setBookingStep('waiting'));
    navigate('/queue');
  };

  return (
    <div className="flex-grow pb-16 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Flame className="h-3.5 w-3.5 animate-bounce" />
          <span>Tata IPL 2026 Ticket Node</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight leading-none mb-6"
        >
          Book IPL Tickets Instantly <br />
          With <span className="text-gradient-accent">FlashSeat AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg text-foreground/75 mb-10"
        >
          Experience next-generation high-concurrency ticketing. Built to handle million-user traffic spikes with fair queue allocation and zero bot leakage.
        </motion.p>
      </div>

      {/* Matches Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <span>Active Ticketing Nodes</span>
          </h2>
          <span className="text-xs font-semibold text-foreground/45 uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded-md">
            UPDATED SECONDS AGO
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl glass animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayMatches?.map((match, idx) => {
              const capPercentage = Math.round((match.availableSeats / match.totalSeats) * 100);
              
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={`glass rounded-2xl border overflow-hidden transition-all group ${
                    match.isFlashSaleActive 
                      ? 'border-primary/30 glow-border' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  {/* Match Banner Top */}
                  <div className="relative p-6 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-foreground/40" />
                        <span className="text-xs text-foreground/60">{match.time.split(' - ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-foreground/40" />
                        <span className="text-[10px] font-semibold text-foreground/45 uppercase tracking-wide truncate max-w-[150px]">
                          {match.stadium.split(',')[0]}
                        </span>
                      </div>
                    </div>

                    {match.isFlashSaleActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        <Flame className="h-3 w-3" /> Live Sale
                      </span>
                    ) : (
                      <MatchTimer targetDate={match.flashSaleStartTime} />
                    )}
                  </div>

                  {/* Versus Teams Panel */}
                  <div className="p-6 text-center space-y-4">
                    <div className="flex items-center justify-center space-x-6">
                      <div className="flex flex-col items-center">
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
                          style={{ backgroundColor: `${match.teams.home.color}25`, border: `2px solid ${match.teams.home.color}` }}
                        >
                          {match.teams.home.logo}
                        </div>
                        <span className="text-xs font-bold mt-1.5">{match.teams.home.short}</span>
                      </div>
                      <span className="font-display font-black text-foreground/40 text-lg">VS</span>
                      <div className="flex flex-col items-center">
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
                          style={{ backgroundColor: `${match.teams.away.color}25`, border: `2px solid ${match.teams.away.color}` }}
                        >
                          {match.teams.away.logo}
                        </div>
                        <span className="text-xs font-bold mt-1.5">{match.teams.away.short}</span>
                      </div>
                    </div>

                    <h3 className="font-display font-extrabold text-sm text-foreground/90 tracking-tight leading-snug line-clamp-1">
                      {match.title}
                    </h3>
                  </div>

                  {/* Seat Loading Progress */}
                  <div className="px-6 pb-4">
                    <div className="flex justify-between items-center mb-1.5 text-xs text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>Ticket Availability</span>
                      </span>
                      <span className="font-semibold text-foreground/80">{match.availableSeats} / {match.totalSeats} left</span>
                    </div>
                    
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          capPercentage < 20 
                            ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                            : capPercentage < 50 
                            ? 'bg-warning' 
                            : 'bg-gradient-to-r from-accent to-secondary'
                        }`}
                        style={{ width: `${capPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Match Footer Booking Gate */}
                  <div className="p-6 pt-2 bg-gradient-to-t from-white/5 to-transparent border-t border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground/45 uppercase tracking-wider font-semibold">TICKET PRICE</span>
                      <span className="font-bold text-foreground">₹{match.ticketPriceGeneral}+</span>
                    </div>

                    {match.isFlashSaleActive ? (
                      <button
                        onClick={() => handleEnterSale(match.id)}
                        className="w-full py-3 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-lg shadow-primary/20 transition-all font-display uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        <span>Join Live Queue</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-white/5 border border-white/5 text-foreground/40 transition-all flex items-center justify-center gap-1.5 cursor-not-allowed uppercase tracking-widest"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Sale Locked</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default LandingPage;
