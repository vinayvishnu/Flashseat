import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Ticket as TicketIcon, Calendar, MapPin, QrCode, ShieldAlert, Download, Share2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyTickets: React.FC = () => {
  const { tickets } = useSelector((state: RootState) => state.auth);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleShare = () => {
    if (!selectedTicket) return;
    navigator.clipboard.writeText(`FlashSeat Ticket node: ${selectedTicket.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            My Secure Passes
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Displaying cryptographic entry passes linked to your authenticated digital profile.
          </p>
        </div>
        <span className="text-xs font-bold text-foreground/45 uppercase tracking-wider bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
          Total Nodes: {tickets.length}
        </span>
      </div>

      {tickets.length === 0 ? (
        <div className="p-12 rounded-2xl glass border border-white/5 text-center text-foreground/50 max-w-md mx-auto space-y-4">
          <TicketIcon className="h-12 w-12 mx-auto text-foreground/20 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-foreground">No Tickets Found</h3>
          <p className="text-sm">You haven't purchased any IPL match tickets yet. Head to the home page to secure your slot!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket, idx) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedTicketId(ticket.id)}
              className="glass rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row cursor-pointer group shadow-lg"
            >
              {/* Left Stub: Event details */}
              <div className="p-6 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider">
                    {ticket.status}
                  </span>
                  <span className="text-[10px] font-bold text-foreground/45 font-mono">TXN: {ticket.id.slice(-6)}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-base leading-snug line-clamp-2">
                    {ticket.matchTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{ticket.matchTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{ticket.stadiumName.split(',')[0]}</span>
                  </div>
                </div>

                <div className="flex gap-4 text-xs pt-2 border-t border-white/5 text-foreground/60">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-foreground/40 block font-bold">Seats</span>
                    <span className="font-bold text-accent">{ticket.seats.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-foreground/40 block font-bold">Gate entrance</span>
                    <span className="font-semibold text-foreground/85">{ticket.gateNo.split(',')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Right Stub: QR Code preview holder */}
              <div className="sm:w-36 bg-gradient-to-b from-white/5 to-transparent border-t sm:border-t-0 sm:border-l border-dashed border-white/10 flex flex-col items-center justify-center p-6 relative">
                {/* Simulated ticket notches */}
                <div className="hidden sm:block absolute top-[-10px] left-[-10px] h-5 w-5 bg-background rounded-full border border-white/5" />
                <div className="hidden sm:block absolute bottom-[-10px] left-[-10px] h-5 w-5 bg-background rounded-full border border-white/5" />
                
                <QrCode className="h-12 w-12 text-foreground/40 group-hover:text-primary transition-colors" />
                <span className="text-[10px] uppercase font-bold text-foreground/45 mt-2 tracking-widest">
                  Tap to Scan
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ticket Scrape Modal */}
      <AnimatePresence>
        {selectedTicketId && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicketId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md glass-premium rounded-3xl border border-white/10 p-6 relative z-10 space-y-6"
            >
              <button
                onClick={() => setSelectedTicketId(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">IPL SECURE ENTRY PASS</span>
                <h2 className="font-display font-extrabold text-lg text-gradient-primary">
                  {selectedTicket.matchTitle}
                </h2>
                <p className="text-xs font-mono text-accent">{selectedTicket.id}</p>
              </div>

              {/* Pulsing QR Code */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.1),transparent)] pointer-events-none" />
                <motion.div
                  animate={{ filter: ['drop-shadow(0 0 4px rgba(0,242,254,0.3))', 'drop-shadow(0 0 12px rgba(0,242,254,0.6))', 'drop-shadow(0 0 4px rgba(0,242,254,0.3))'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="p-3 bg-white rounded-xl shadow-md border-2 border-accent"
                >
                  <img
                    src={selectedTicket.qrCode}
                    alt="Secure Access QR Code"
                    className="h-44 w-44"
                  />
                </motion.div>
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider mt-4 flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>Dynamic QR Code refreshes at gate</span>
                </span>
              </div>

              {/* metadata layout */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y border-white/5 py-4">
                <div>
                  <span className="text-[10px] text-foreground/40 uppercase block font-bold">Seats Allocation</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedTicket.seats.join(', ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-foreground/40 uppercase block font-bold">Stadium Gate</span>
                  <span className="font-bold text-foreground mt-0.5 block">{selectedTicket.gateNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-foreground/40 uppercase block font-bold">Match Time</span>
                  <span className="font-semibold text-foreground/80 mt-0.5 block truncate">{selectedTicket.matchTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-foreground/40 uppercase block font-bold">Amount Settled</span>
                  <span className="font-bold text-success mt-0.5 block">₹{selectedTicket.totalPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Download / Share links */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => alert('Secure pass downloaded to local system cache as PDF stub.')}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-foreground/80"
                >
                  <Download className="h-4 w-4 text-accent" />
                  <span>Download Pass</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all text-foreground/80"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-success" />
                      <span>Copied TXN</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 text-secondary" />
                      <span>Share Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default MyTickets;
