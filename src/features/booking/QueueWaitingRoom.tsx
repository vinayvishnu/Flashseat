import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setQueueStatus, updateQueue, setBookingStep } from '../../store/bookingSlice';
import { socket } from '../../services/socket';
import { useGetMatchByIdQuery } from '../../services/api';
import { ShieldCheck, Users, Activity, Terminal, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QueueWaitingRoom: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedMatchId, queuePosition, queueEta, queueStatus } = useSelector(
    (state: RootState) => state.booking
  );

  const { data: match } = useGetMatchByIdQuery(selectedMatchId || '', {
    skip: !selectedMatchId,
  });

  const [logs, setLogs] = useState<string[]>([
    '⚙️ Initializing secure pipeline socket...',
    '🛡️ Running device signature inspection...',
    '🕵️ Performing CAPTCHA security token validations...'
  ]);

  const [initialQueueSize, setInitialQueueSize] = useState<number>(0);

  // Generate rotating logs for a premium engineering feel
  useEffect(() => {
    if (queueStatus !== 'waiting') return;

    const mockLogs = [
      '📡 Resolving cloud flare ticket routing endpoints...',
      '🔍 Authenticating API security headers...',
      '⚡ Testing socket connection handshake parameters...',
      '🤖 Scanning queue node for potential scalper scripts...',
      '📈 Load balancer allocating slot reservation memory...',
      '🔒 Seat mapper verifying transaction concurrency boundaries...',
      '⏱️ Syncing server clock with local browser clock...',
      '🏟️ Downloading vector layout for stadium nodes...',
      '🎫 Securing ticket purchase window allocation token...'
    ];

    const interval = setInterval(() => {
      const randomLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
      setLogs((prev) => [...prev.slice(-4), `⚙️ ${randomLog}`]);
    }, 2800);

    return () => clearInterval(interval);
  }, [queueStatus]);

  useEffect(() => {
    if (!selectedMatchId) {
      navigate('/dashboard');
      return;
    }

    // Connect socket and register events
    socket.connect();
    socket.emit('request_queue_join', { matchId: selectedMatchId });
    dispatch(setQueueStatus('waiting'));

    const handleQueueUpdate = (data: { position: number; eta: number }) => {
      dispatch(updateQueue({ position: data.position, eta: data.eta }));
      
      // Track initial queue size to calculate progress %
      setInitialQueueSize((prev) => {
        if (prev === 0) return data.position;
        return prev;
      });
    };

    const handleQueuePassed = () => {
      dispatch(setQueueStatus('passed'));
      dispatch(setBookingStep('selection'));
      navigate('/seat-selection');
    };

    socket.on('queue_update', handleQueueUpdate);
    socket.on('queue_passed', handleQueuePassed);

    return () => {
      socket.off('queue_update', handleQueueUpdate);
      socket.off('queue_passed', handleQueuePassed);
    };
  }, [selectedMatchId, navigate, dispatch]);

  const handleExitQueue = () => {
    dispatch(setQueueStatus('idle'));
    dispatch(setBookingStep('browse'));
    navigate('/dashboard');
  };

  const progressPercent = initialQueueSize > 0 
    ? Math.max(0, Math.min(100, Math.round(((initialQueueSize - queuePosition) / initialQueueSize) * 100)))
    : 0;

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/80 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.12),rgba(255,255,255,0))]" />
      
      <div className="max-w-xl w-full space-y-8 glass-premium p-8 rounded-3xl relative z-10 text-center">
        {/* Header Branding */}
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider mb-4">
            <Activity className="h-3.5 w-3.5 animate-pulse" /> Virtual Waiting Room
          </span>
          <h1 className="font-display text-2xl font-extrabold text-foreground tracking-tight leading-snug">
            {match?.title || 'IPL Flash Sale Booking'}
          </h1>
          <p className="text-xs text-foreground/45 mt-1 font-semibold uppercase tracking-wider">
            Match ID: {selectedMatchId?.toUpperCase()}
          </p>
        </div>

        {/* Circular Queue Position Indicator */}
        <div className="relative flex justify-center items-center py-4">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              stroke="url(#progressGradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - progressPercent / 100)}
              transition={{ ease: "easeInOut", duration: 1.5 }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F2FE" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-foreground/50 uppercase tracking-wider">Queue Position</span>
            <span className="text-4xl font-extrabold font-display text-foreground tracking-tight mt-1">
              {queuePosition}
            </span>
            <span className="text-xs font-semibold text-accent mt-1.5">{progressPercent}% Progress</span>
          </div>
        </div>

        {/* Time Estimations Panel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Estimated Wait Time</span>
            <span className="text-xl font-extrabold font-display text-primary mt-1 block">
              {queueEta > 60 ? `${Math.ceil(queueEta / 60)} min` : `${queueEta} sec`}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wide block">Platform Speed</span>
            <span className="text-xl font-extrabold font-display text-secondary mt-1 block">
              High Velocity
            </span>
          </div>
        </div>

        {/* Warning Bar */}
        <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs text-left flex gap-2.5 leading-normal">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            Do not refresh this page or navigate away. Closing this page will terminate your ticket routing token and you will forfeit your place in the queue.
          </p>
        </div>

        {/* Real-time terminal logs */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-left font-mono text-[10px] text-accent/80 space-y-1.5 h-36 overflow-hidden flex flex-col justify-end shadow-inner">
          <div className="flex items-center gap-1.5 text-foreground/45 border-b border-white/5 pb-1.5 mb-2 font-bold font-sans uppercase">
            <Terminal className="h-3.5 w-3.5" />
            <span>Interactive Node Logs</span>
          </div>
          <AnimatePresence initial={false}>
            {logs.map((log, index) => (
              <motion.div
                key={log + index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action controls */}
        <div className="pt-2">
          <button
            onClick={handleExitQueue}
            className="px-6 py-2.5 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all text-foreground/60 hover:text-foreground uppercase tracking-widest"
          >
            Leave Queue Room
          </button>
        </div>
      </div>
    </div>
  );
};
export default QueueWaitingRoom;
