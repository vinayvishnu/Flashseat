import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  toggleSeatSelection, 
  lockSeatsExternally, 
  unlockSeatsExternally, 
  setBookingStep 
} from '../../store/bookingSlice';
import { useGetMatchByIdQuery, useGetEventSeatsQuery, useStartBookingMutation } from '../../services/api';
import { socket } from '../../services/socket';
import { Users, Info, Shield, Layers, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const StadiumSeatSelection: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedMatchId, selectedSeats } = useSelector(
    (state: RootState) => state.booking
  );

  const { data: match } = useGetMatchByIdQuery(selectedMatchId || '', {
    skip: !selectedMatchId,
  });

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'VIP' | 'PREM' | 'GEN'>('ALL');

  const { data: seatData, refetch: refetchSeats } = useGetEventSeatsQuery(selectedMatchId || '', {
    skip: !selectedMatchId,
  });

  const [startBooking] = useStartBookingMutation();

  const lockedSeatsByOthers = seatData
    ? seatData.filter((s: any) => s.status === 'LOCKED').map((s: any) => s.seatNumber)
    : [];

  const bookedSeats = seatData
    ? seatData.filter((s: any) => s.status === 'SOLD').map((s: any) => s.seatNumber)
    : [];

  // Load real-time socket events for locking/unlocking seats
  useEffect(() => {
    if (!selectedMatchId) {
      navigate('/dashboard');
      return;
    }

    socket.connect();

    const handleSeatUpdate = (data: { eventId: string }) => {
      if (data.eventId === selectedMatchId) {
        refetchSeats();
      }
    };

    socket.on('seat:update', handleSeatUpdate);

    return () => {
      socket.off('seat:update', handleSeatUpdate);
    };
  }, [selectedMatchId, navigate, refetchSeats]);

  const handleSeatClick = async (seatId: string) => {
    if (bookedSeats.includes(seatId) || lockedSeatsByOthers.includes(seatId)) {
      return; // seat is unavailable
    }

    if (selectedSeats.includes(seatId)) {
      // Toggle locally
      dispatch(toggleSeatSelection(seatId));
    } else {
      if (selectedSeats.length >= 4) {
        alert('Anti-scalping rule: Maximum 4 tickets can be booked per user.');
        return;
      }
      try {
        const res = await startBooking({ eventId: selectedMatchId!, seatNumber: seatId }).unwrap();
        if (res.success) {
          dispatch(toggleSeatSelection(seatId));
          // Store the booking ID for tracking the Saga progress
          sessionStorage.setItem(`booking_${seatId}`, res.data.bookingId);
        }
      } catch (err: any) {
        alert(err.data?.error || 'Failed to lock seat. It may have been locked by another user.');
        refetchSeats();
      }
    }
  };

  const getSeatCategory = (seatId: string): 'VIP' | 'PREM' | 'GEN' => {
    if (seatId.startsWith('A-VIP')) return 'VIP';
    if (seatId.startsWith('B-PREM')) return 'PREM';
    return 'GEN';
  };

  // Calculate pricing
  const calculateTotal = () => {
    if (!match) return 0;
    return selectedSeats.reduce((total, seatId) => {
      const cat = getSeatCategory(seatId);
      if (cat === 'VIP') return total + match.ticketPriceVIP;
      if (cat === 'PREM') return total + match.ticketPricePremium;
      return total + match.ticketPriceGeneral;
    }, 0);
  };

  // Generate seats grid
  const renderSeats = () => {
    const vipSeats = Array.from({ length: 24 }, (_, i) => `A-VIP-${i + 1}`);
    const premSeats = Array.from({ length: 60 }, (_, i) => `B-PREM-${i + 1}`);
    const genSeats = Array.from({ length: 120 }, (_, i) => `C-GEN-${i + 1}`);

    let displayedSeats: string[] = [];
    if (activeCategory === 'ALL') {
      displayedSeats = [...vipSeats, ...premSeats, ...genSeats];
    } else if (activeCategory === 'VIP') {
      displayedSeats = vipSeats;
    } else if (activeCategory === 'PREM') {
      displayedSeats = premSeats;
    } else {
      displayedSeats = genSeats;
    }

    return (
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 justify-items-center">
        {displayedSeats.map((seatId) => {
          const isSelected = selectedSeats.includes(seatId);
          const isBooked = bookedSeats.includes(seatId);
          const isLockedByOther = lockedSeatsByOthers.includes(seatId);
          const cat = getSeatCategory(seatId);

          let bgClass = 'bg-white/5 border-white/10 text-foreground/50 hover:bg-white/15';
          if (isSelected) {
            bgClass = 'bg-primary border-primary text-white shadow-[0_0_8px_rgba(255,71,87,0.6)]';
          } else if (isBooked) {
            bgClass = 'bg-red-950/20 border-red-950/40 text-red-900/30 cursor-not-allowed';
          } else if (isLockedByOther) {
            bgClass = 'bg-amber-950/30 border-amber-500/30 text-amber-500/40 cursor-not-allowed animate-pulse';
          } else {
            // color coded boundaries
            if (cat === 'VIP') bgClass = 'border-violet-500/30 hover:bg-violet-500/10 text-violet-400/80';
            else if (cat === 'PREM') bgClass = 'border-blue-500/30 hover:bg-blue-500/10 text-blue-400/80';
            else bgClass = 'border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400/80';
          }

          return (
            <motion.button
              key={seatId}
              whileTap={{ scale: 0.9 }}
              disabled={isBooked || isLockedByOther}
              onClick={() => handleSeatClick(seatId)}
              className={`h-9 w-9 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center ${bgClass}`}
              title={`${seatId} - ${cat}`}
            >
              {seatId.split('-').pop()}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    dispatch(setBookingStep('details'));
    navigate('/booking-status');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Header match summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-widest block">STEP 1: CHOOSE SEATS</span>
          <h1 className="font-display text-2xl font-extrabold text-foreground mt-1">
            {match?.title || 'Stadium Seat Allocation'}
          </h1>
          <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-accent" />
            <span>Select up to 4 tickets. Real-time availability updates are active.</span>
          </p>
        </div>

        {/* Categories selector filter */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1 shrink-0">
          {(['ALL', 'VIP', 'PREM', 'GEN'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-secondary text-white'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Stadium seating map */}
        <div className="lg:col-span-3 glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[500px]">
          {/* Screens / Field boundary indicator */}
          <div className="relative mb-8 text-center">
            <div className="h-2 w-[70%] mx-auto bg-gradient-to-r from-accent to-secondary rounded-full blur-[2px]" />
            <span className="text-[10px] uppercase tracking-widest text-foreground/45 mt-2 block font-bold">
              PLAYING FIELD / WICKET DIRECTION
            </span>
          </div>

          {/* Seating Layout Grid */}
          <div className="flex-grow flex items-center justify-center py-4 overflow-x-auto">
            {renderSeats()}
          </div>

          {/* Legend panel */}
          <div className="border-t border-white/5 pt-6 mt-8 flex flex-wrap gap-6 justify-center text-xs">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-white/5 border border-white/10" />
              <span className="text-foreground/60">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-primary border border-primary shadow-[0_0_8px_rgba(255,71,87,0.4)]" />
              <span className="text-foreground/60">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-amber-500/20 border border-amber-500/40" />
              <span className="text-foreground/60">Locked (Other Users)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-red-950/20 border border-red-950/40 text-red-900/20 flex items-center justify-center text-[8px] font-black">X</span>
              <span className="text-foreground/60">Booked</span>
            </div>
          </div>
        </div>

        {/* Selection side panel */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h2 className="text-lg font-bold font-display mb-4 text-gradient-primary">Allocation Summary</h2>
            
            {selectedSeats.length === 0 ? (
              <div className="text-center py-8 text-foreground/40 text-sm space-y-2">
                <Layers className="h-8 w-8 mx-auto text-foreground/20" />
                <p>No seats selected yet. Click on the seating grid to lock seats.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {selectedSeats.map((seatId) => {
                    const cat = getSeatCategory(seatId);
                    const price = cat === 'VIP' 
                      ? match?.ticketPriceVIP 
                      : cat === 'PREM' 
                      ? match?.ticketPricePremium 
                      : match?.ticketPriceGeneral;

                    return (
                      <div key={seatId} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5">
                        <div>
                          <span className="font-bold text-accent mr-2">{seatId}</span>
                          <span className="text-xs text-foreground/50 uppercase tracking-wider">{cat} Stand</span>
                        </div>
                        <span className="font-semibold">₹{price?.toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-foreground/60">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-foreground/60">
                    <span>Taxes & GST (18%)</span>
                    <span>₹{(calculateTotal() * 0.18).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-dashed border-white/5">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{(calculateTotal() * 1.18).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 py-3 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-lg shadow-primary/20 transition-all font-display uppercase tracking-widest"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>

          {/* Anti bots credentials badge */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-2.5 text-xs text-foreground/60 leading-normal">
            <Shield className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="font-semibold text-foreground/80 mb-0.5">Secure Transaction Session</p>
              <p>Your selected seats are locked under a temporary lease window of 5 minutes once checkout begins.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StadiumSeatSelection;
