import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setSelectedMatch } from '../store/bookingSlice';
import { Ticket as TicketIcon, Calendar, Wallet, Settings, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, tickets } = useSelector((state: RootState) => state.auth);
  const { matches } = useSelector((state: RootState) => state.admin);

  if (!user) return null;

  const confirmedTickets = tickets.filter(t => t.status === 'confirmed');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Welcome Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            Welcome back, <span className="text-gradient-primary">{user.name}</span>
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Secure IPL Ticket Node Dashboard. Authentication state: <span className="text-success font-semibold">VERIFIED</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-foreground/75 hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Simulated Wallet Balance</span>
            <span className="text-2xl font-extrabold font-display mt-1 block">
              ₹{user.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary shadow">
            <Wallet className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Confirmed Bookings</span>
            <span className="text-2xl font-extrabold font-display mt-1 block">
              {confirmedTickets.length}
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shadow">
            <TicketIcon className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide block">Active Sales Tickers</span>
            <span className="text-2xl font-extrabold font-display mt-1 block">
              {matches.filter(m => m.isFlashSaleActive).length} Live
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent shadow">
            <Clock className="h-6 w-6" />
          </div>
        </motion.div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tickets list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <TicketIcon className="h-5 w-5 text-primary" />
              <span>Your Booked Passes</span>
            </h2>
            <Link to="/my-tickets" className="text-xs font-bold text-secondary hover:underline uppercase tracking-wider">
              View All
            </Link>
          </div>

          {confirmedTickets.length === 0 ? (
            <div className="p-8 rounded-2xl glass border border-white/5 text-center text-foreground/50 space-y-4">
              <p>You have not secured any ticketing passes yet.</p>
              <Link
                to="/"
                className="inline-flex py-2 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md shadow-primary/15 transition-all uppercase tracking-wider"
              >
                Browse Live Sales
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedTickets.slice(0, 3).map((ticket) => (
                <motion.div
                  key={ticket.id}
                  whileHover={{ x: 4 }}
                  className="glass rounded-xl p-5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all cursor-pointer"
                  onClick={() => navigate('/my-tickets')}
                >
                  <div>
                    <h3 className="text-sm font-bold truncate max-w-sm">{ticket.matchTitle}</h3>
                    <p className="text-xs text-foreground/50 mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{ticket.matchTime}</span>
                    </p>
                    <p className="text-xs text-foreground/60 mt-1.5">
                      Seats: <span className="font-semibold text-accent">{ticket.seats.join(', ')}</span> • gate: {ticket.gateNo}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 justify-between">
                    <span className="text-xs font-bold text-foreground/45 uppercase tracking-wide">ID: {ticket.id.slice(-4)}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Sale Quick gate */}
        <div className="space-y-6">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            <span>Fast Booking Entrance</span>
          </h2>

          <div className="space-y-4">
            {matches.map((match) => (
              <div 
                key={match.id}
                className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                  match.isFlashSaleActive 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-foreground/90 line-clamp-1">{match.title}</h4>
                    <p className="text-[10px] text-foreground/50 mt-0.5">{match.stadium.split(',')[0]}</p>
                  </div>
                  {match.isFlashSaleActive ? (
                    <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider animate-pulse">
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-foreground/40 text-[8px] font-bold uppercase tracking-wider">
                      Locked
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wide font-semibold">TICKET PRICE</span>
                  <span className="font-bold text-foreground/80">₹{match.ticketPriceGeneral}+</span>
                </div>

                {match.isFlashSaleActive ? (
                  <button
                    onClick={() => {
                      dispatch(setSelectedMatch(match.id));
                      navigate('/queue');
                    }}
                    className="w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-all uppercase tracking-wide"
                  >
                    Enter Booking Room
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 text-center text-xs font-semibold rounded-lg bg-white/5 border border-white/5 text-foreground/30 transition-all uppercase tracking-wide cursor-not-allowed"
                  >
                    Sale Starts Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
