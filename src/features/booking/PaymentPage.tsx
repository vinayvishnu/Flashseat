import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setBookingStep, setPaymentProcessing, setPaymentSuccess } from '../../store/bookingSlice';
import { addTicket } from '../../store/authSlice';
import { usePurchaseTicketsMutation } from '../../services/api';
import { CreditCard, ShieldCheck, Wallet, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedMatchId, selectedSeats } = useSelector((state: RootState) => state.booking);
  const { user } = useSelector((state: RootState) => state.auth);
  const adminMatches = useSelector((state: RootState) => state.admin.matches);
  const match = adminMatches.find(m => m.id === selectedMatchId);

  const [purchaseTickets] = usePurchaseTicketsMutation();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [payMethod, setPayMethod] = useState<'wallet' | 'card'>('wallet');
  const [processing, setProcessing] = useState(false);

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
    return Math.round(base * 1.18);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !user) {
      navigate('/dashboard');
      return;
    }

    const totalCost = calculateTotal();
    if (payMethod === 'wallet' && user.walletBalance < totalCost) {
      alert('Insufficient wallet balance. Please add funds or use credit card option.');
      return;
    }

    setProcessing(true);
    dispatch(setPaymentProcessing(true));

    try {
      const result = await purchaseTickets({
        matchId: match.id,
        seats: selectedSeats,
        totalAmount: totalCost,
        paymentDetails: { method: payMethod }
      }).unwrap();

      if (result.success) {
        dispatch(setPaymentSuccess(true));
        dispatch(addTicket({
          id: result.transactionId,
          matchId: match.id,
          matchTitle: match.title,
          matchTime: match.time,
          stadiumName: match.stadium,
          seats: selectedSeats,
          totalPaid: totalCost,
          status: 'confirmed',
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${result.transactionId}`,
          bookingDate: new Date().toISOString(),
          gateNo: getSeatCategory(selectedSeats[0]) === 'VIP' ? 'Gate 1, VIP Pavilion' : 'Gate 4, Stand B',
        }));
        dispatch(setBookingStep('success'));
        navigate('/booking-status');
      }
    } catch (err) {
      alert('Payment processing error');
    } finally {
      setProcessing(false);
      dispatch(setPaymentProcessing(false));
    }
  };

  if (!match || selectedSeats.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-xl font-bold">No Seating Reservations Found</h2>
        <p className="text-sm text-foreground/60">Choose a match and select seats before launching the payment gateway.</p>
        <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold">
          Browse Matches
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <button 
        onClick={() => navigate('/booking-status')}
        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground/50 hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Stepper</span>
      </button>

      <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
        <h2 className="text-lg font-bold font-display text-gradient-primary flex items-center gap-1.5">
          <CreditCard className="h-5 w-5 text-primary" />
          <span>Ticket Payment Gateway</span>
        </h2>

        {/* Form panel */}
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
            <button
              type="button"
              onClick={() => setPayMethod('wallet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                payMethod === 'wallet' ? 'bg-secondary text-white' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Wallet (₹{user?.walletBalance.toLocaleString('en-IN')})
            </button>
            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                payMethod === 'card' ? 'bg-secondary text-white' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              Credit Card
            </button>
          </div>

          {payMethod === 'card' && (
            <div className="space-y-4">
              <input
                type="text"
                required
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
                className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm"
                />
                <input
                  type="password"
                  required
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm"
                />
              </div>
            </div>
          )}

          <div className="border-t border-white/5 pt-4 text-sm font-bold flex justify-between">
            <span>Total Payable Amount</span>
            <span className="text-primary">₹{calculateTotal().toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-success to-emerald-600 hover:opacity-95 shadow-lg shadow-success/20 transition-all font-display uppercase tracking-widest flex items-center justify-center gap-1.5"
          >
            {processing ? 'Processing Payment...' : 'Pay & Confirm Tickets'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default PaymentPage;
