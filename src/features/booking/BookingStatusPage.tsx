import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  setBookingStep, 
  startCheckoutTimer, 
  tickCheckoutTimer, 
  resetBooking,
  setPaymentProcessing,
  setPaymentSuccess
} from '../../store/bookingSlice';
import { addTicket } from '../../store/authSlice';
import { usePurchaseTicketsMutation } from '../../services/api';
import { Clock, ShieldCheck, CreditCard, ChevronRight, User, Mail, Phone, CheckCircle, Ticket, Calendar, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookingStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    selectedMatchId, 
    selectedSeats, 
    bookingStep, 
    checkoutTimer, 
    paymentProcessing,
    paymentSuccess 
  } = useSelector((state: RootState) => state.booking);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const adminMatches = useSelector((state: RootState) => state.admin.matches);
  const match = adminMatches.find(m => m.id === selectedMatchId);

  const [purchaseTickets] = usePurchaseTicketsMutation();

  // Attendee state inputs
  const [attendees, setAttendees] = useState<Record<string, string>>({});
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Payment inputs
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payMethod, setPayMethod] = useState<'wallet' | 'card'>('wallet');

  const [txnId, setTxnId] = useState('');

  // Countdown timer activation
  useEffect(() => {
    if (bookingStep === 'browse' || bookingStep === 'waiting') return;

    // Start timer on selection/details if not already running
    if (checkoutTimer === 0) {
      dispatch(startCheckoutTimer(300)); // 5 minutes
    }

    const interval = setInterval(() => {
      dispatch(tickCheckoutTimer());
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingStep, checkoutTimer, dispatch]);

  // Handle timeout redirection
  useEffect(() => {
    if (checkoutTimer === 0 && bookingStep !== 'success' && bookingStep !== 'browse' && bookingStep !== 'waiting') {
      alert('Transaction Lease Expired. Your locked seats have been released.');
      dispatch(resetBooking());
      navigate('/dashboard');
    }
  }, [checkoutTimer, bookingStep, dispatch, navigate]);

  const getSeatCategory = (seatId: string): 'VIP' | 'PREM' | 'GEN' => {
    if (seatId.startsWith('A-VIP')) return 'VIP';
    if (seatId.startsWith('B-PREM')) return 'PREM';
    return 'GEN';
  };

  const calculateTotal = () => {
    if (!match) return 0;
    const base = selectedSeats.reduce((total, seatId) => {
      const cat = getSeatCategory(seatId);
      if (cat === 'VIP') return total + match.ticketPriceVIP;
      if (cat === 'PREM') return total + match.ticketPricePremium;
      return total + match.ticketPriceGeneral;
    }, 0);
    return Math.round(base * 1.18); // Including GST
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setBookingStep('payment'));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !user) return;

    const totalCost = calculateTotal();
    if (payMethod === 'wallet' && user.walletBalance < totalCost) {
      alert('Insufficient wallet balance. Please add funds in settings or use credit card option.');
      return;
    }

    dispatch(setPaymentProcessing(true));

    try {
      const result = await purchaseTickets({
        matchId: match.id,
        seats: selectedSeats,
        totalAmount: totalCost,
        paymentDetails: payMethod === 'wallet' ? { method: 'wallet' } : { method: 'card', cardNumber }
      }).unwrap();

      if (result.success) {
        setTxnId(result.transactionId);
        dispatch(setPaymentSuccess(true));
        
        // Add ticket to user history
        dispatch(addTicket({
          id: result.transactionId,
          matchId: match.id,
          matchTitle: match.title,
          matchTime: match.time,
          stadiumName: match.stadium,
          seats: selectedSeats,
          totalPaid: totalCost,
          status: 'confirmed',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${result.transactionId}-${selectedSeats.join('-')}`,
          bookingDate: new Date().toISOString(),
          gateNo: getSeatCategory(selectedSeats[0]) === 'VIP' ? 'Gate 1, VIP Pavilion' : 'Gate 4, Stand B',
        }));

        dispatch(setBookingStep('success'));
      }
    } catch (err) {
      alert('Payment processing failed. Please try again.');
    } finally {
      dispatch(setPaymentProcessing(false));
    }
  };

  // Timer format display
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { key: 'details', label: 'Details' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Success' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex-grow flex flex-col justify-start">
      {/* Checkout timer banner */}
      {bookingStep !== 'success' && (
        <div className="mb-6 flex justify-between items-center bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>Secure Checkout Session Lease Time Remaining</span>
          </div>
          <span className="text-xl font-bold font-mono">{formatTime(checkoutTimer)}</span>
        </div>
      )}

      {/* Stepper Header */}
      <div className="relative flex items-center justify-between mb-8 max-w-lg mx-auto w-full px-4">
        {steps.map((st, i) => {
          const isCompleted = steps.findIndex(s => s.key === bookingStep) > i || bookingStep === 'success';
          const isCurrent = bookingStep === st.key;

          return (
            <div key={st.key} className="flex items-center relative z-10">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                  isCompleted 
                    ? 'bg-success border-success text-white' 
                    : isCurrent 
                    ? 'bg-primary border-primary text-white shadow-[0_0_8px_rgba(255,71,87,0.5)]' 
                    : 'bg-white/5 border-white/10 text-foreground/45'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${
                  isCurrent ? 'text-primary' : 'text-foreground/45'
                }`}>
                  {st.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="h-0.5 w-16 sm:w-28 bg-white/5 border-b border-dashed border-white/10 mt-[-16px] z-[-1]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stepper Content Pages */}
      <AnimatePresence mode="wait">
        {bookingStep === 'details' && (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Attendees details form */}
            <div className="md:col-span-2 glass rounded-3xl p-6 border border-white/5 space-y-6">
              <h2 className="text-lg font-bold font-display text-gradient-primary flex items-center gap-1.5">
                <User className="h-5 w-5 text-primary" />
                <span>Passenger / Attendee Details</span>
              </h2>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                {selectedSeats.map((seatId) => (
                  <div key={seatId} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-accent">
                      <span>ATTENDEE FOR SEAT {seatId}</span>
                      <span className="uppercase text-[10px] tracking-wider text-foreground/45">{getSeatCategory(seatId)} Seat</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      value={attendees[seatId] || ''}
                      onChange={(e) => setAttendees({ ...attendees, [seatId]: e.target.value })}
                      className="block w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Delivery Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Delivery Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9988776655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md shadow-primary/10 transition-all font-display uppercase tracking-widest flex items-center gap-1"
                  >
                    <span>Proceed to Payment</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Match summary side widget */}
            <div className="glass rounded-3xl p-6 border border-white/5 h-fit space-y-4">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground/80">Match Details</h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-foreground/50 uppercase block font-semibold">{match?.stadium.split(',')[0]}</span>
                <span className="text-sm font-bold mt-1 block truncate">{match?.title}</span>
                <span className="text-[10px] text-primary font-bold mt-1.5 block">{match?.time}</span>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-foreground/60">
                  <span>Seats Locked</span>
                  <span className="font-bold text-accent">{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-2 border-t border-dashed border-white/5">
                  <span>Payable amount</span>
                  <span className="text-primary">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {bookingStep === 'payment' && (
          <motion.div
            key="payment-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Payment Panel */}
            <div className="md:col-span-2 glass rounded-3xl p-6 border border-white/5 space-y-6">
              <h2 className="text-lg font-bold font-display text-gradient-primary flex items-center gap-1.5">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Secure Ticket checkout Gateway</span>
              </h2>

              {/* Payment Methods toggle */}
              <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
                <button
                  onClick={() => setPayMethod('wallet')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    payMethod === 'wallet' ? 'bg-secondary text-white' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Simulated Wallet
                </button>
                <button
                  onClick={() => setPayMethod('card')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    payMethod === 'card' ? 'bg-secondary text-white' : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  Credit/Debit Card
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {payMethod === 'wallet' ? (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-foreground/60">Wallet Balance</span>
                      <span className="font-bold text-foreground">₹{user?.walletBalance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-foreground/60">Tickets Subtotal</span>
                      <span className="font-bold text-primary">₹{calculateTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between items-center text-sm font-bold">
                      <span className="text-foreground/75">Remaining Balance after Purchase</span>
                      <span className={user && user.walletBalance >= calculateTotal() ? 'text-success' : 'text-danger'}>
                        ₹{user ? (user.walletBalance - calculateTotal()).toLocaleString('en-IN') : 0}
                      </span>
                    </div>

                    {user && user.walletBalance < calculateTotal() && (
                      <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex gap-2 leading-normal">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>Insufficient wallet balance. You can reload funds in your profile settings, or use the simulated Credit Card payment option instead.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-gradient-to-tr from-secondary to-indigo-900 border border-white/10 text-white relative overflow-hidden shadow-lg h-44 flex flex-col justify-between">
                      <div className="absolute top-0 right-0 h-28 w-28 bg-white/5 rounded-full blur-xl" />
                      <div className="flex justify-between items-start">
                        <span className="font-display font-extrabold text-sm tracking-wider uppercase">FlashSeat Checkout</span>
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-mono tracking-widest">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span>VINAY KUMAR</span>
                          <span>{expiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Card Number</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none"
                          placeholder="4111 2222 3333 4444"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Expiry Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full py-3.5 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-success to-emerald-600 hover:opacity-95 shadow-lg shadow-success/20 transition-all font-display uppercase tracking-widest flex items-center justify-center gap-1.5"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Settling Ticket Reserve Ledger...</span>
                    </>
                  ) : (
                    <span>Settle Ticket Payment</span>
                  )}
                </button>
              </form>
            </div>

            {/* Pricing side panel summary */}
            <div className="glass rounded-3xl p-6 border border-white/5 h-fit space-y-4">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-foreground/80">Checkout Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-foreground/60">
                  <span>Match Name</span>
                  <span className="font-semibold text-foreground/80 text-right truncate max-w-[150px]">{match?.title}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>Selected Seats</span>
                  <span className="font-bold text-accent">{selectedSeats.join(', ')}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-2 border-t border-white/5 text-sm">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {bookingStep === 'success' && (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-premium rounded-3xl p-8 border border-success/20 text-center max-w-2xl mx-auto w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-44 w-44 bg-success/15 rounded-full blur-2xl" />
            
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-success/15 border border-success/30 rounded-full flex items-center justify-center text-success shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>

            <h2 className="font-display text-2xl font-black text-gradient-primary mb-2">
              IPL Pass Secured!
            </h2>
            <p className="text-sm text-foreground/60 max-w-md mx-auto">
              Your tickets have been issued and digital cryptographic signatures have been appended to your ledger node.
            </p>

            {/* Ticket details summary display */}
            <div className="my-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-foreground/50 uppercase">Match Event</h3>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">{match?.title}</span>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-foreground/50 uppercase">Transaction ID</h3>
                  <span className="text-xs font-mono font-bold text-accent mt-0.5 block">{txnId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wide block font-bold">Seats Allocation</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">{selectedSeats.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wide block font-bold">Gate / Stand Entrance</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {getSeatCategory(selectedSeats[0]) === 'VIP' ? 'Gate 1, VIP Pavilion' : 'Gate 4, Stand B'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  dispatch(resetBooking());
                  navigate('/my-tickets');
                }}
                className="py-3 px-6 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md shadow-primary/20 transition-all font-display uppercase tracking-widest flex items-center justify-center gap-1.5"
              >
                <Ticket className="h-4 w-4" />
                <span>View My Tickets</span>
              </button>
              <button
                onClick={() => {
                  dispatch(resetBooking());
                  navigate('/dashboard');
                }}
                className="py-3 px-6 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 transition-all text-foreground/75 hover:text-foreground uppercase tracking-widest"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default BookingStatusPage;
