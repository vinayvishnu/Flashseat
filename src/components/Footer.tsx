import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import { Terminal, Zap, Shield, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Footer: React.FC = () => {
  const [tickerMessage, setTickerMessage] = useState<string>('⚡ Live Sale Platform active. High volume traffic expected.');

  useEffect(() => {
    socket.connect();
    
    const handleTicker = (data: { message: string }) => {
      setTickerMessage(data.message);
    };

    socket.on('live_sale_ticker', handleTicker);

    return () => {
      socket.off('live_sale_ticker', handleTicker);
    };
  }, []);

  return (
    <footer className="relative mt-auto border-t border-white/5 bg-background">
      {/* Real-time Ticker Banner */}
      <div className="bg-gradient-to-r from-primary/90 to-secondary/90 text-white py-2 overflow-hidden relative shadow-inner">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10 pointer-events-none" />
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="text-sm font-semibold tracking-wide flex items-center space-x-2 px-4 uppercase">
            <span>{tickerMessage}</span>
          </span>
          <span className="text-sm font-semibold tracking-wide flex items-center space-x-2 px-4 uppercase">
            <span>🎫 SECURE STADIUM SEATING RESERVED VIA VIRTUAL PIPELINE</span>
          </span>
          <span className="text-sm font-semibold tracking-wide flex items-center space-x-2 px-4 uppercase">
            <span>🔥 DEMAND IS EXTREMELY HIGH: VIP SEATS EXPIRING FAST</span>
          </span>
          <span className="text-sm font-semibold tracking-wide flex items-center space-x-2 px-4 uppercase">
            <span>{tickerMessage}</span>
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>FlashSeat AI</span>
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Enterprise-grade real-time ticketing platform designed for high-concurrency IPL flash ticket sales.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-secondary" /> Virtual Waiting Room</li>
              <li className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-secondary" /> Real-time Seating Maps</li>
              <li className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-secondary" /> Instant Payment Settlement</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-accent" /> Booking Help Desk</li>
              <li className="flex items-center gap-1.5">🛡️ Security and Anti-Bot</li>
              <li className="flex items-center gap-1.5">💼 Merchant Portal</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-4 uppercase tracking-wider">IPL Partner</h4>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="font-display font-extrabold text-2xl tracking-widest text-primary/80 uppercase">
                TATA IPL
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/45">
            © 2026 FlashSeat AI. All rights reserved. Licensed to IPL Ticketing Agency.
          </p>
          <div className="flex space-x-6 text-xs text-foreground/45">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Anti-Scalping Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
