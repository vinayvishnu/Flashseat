import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  toggleFlashSale, 
  toggleGlobalSalePause, 
  adjustQueueSpeed, 
  updateAvailableSeats,
  configureMatchPrice 
} from '../../store/adminSlice';
import { socket } from '../../services/socket';
import { ShieldAlert, Play, Pause, Users, Settings, Sliders, Ticket, Check, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { matches, isGlobalSalePaused, systemTraffic, simulatedQueueSpeed } = useSelector(
    (state: RootState) => state.admin
  );

  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id || '');
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Price adjustment inputs
  const [vipPrice, setVipPrice] = useState(selectedMatch?.ticketPriceVIP.toString() || '7500');
  const [premPrice, setPremPrice] = useState(selectedMatch?.ticketPricePremium.toString() || '3500');
  const [genPrice, setGenPrice] = useState(selectedMatch?.ticketPriceGeneral.toString() || '1500');
  const [priceSuccess, setPriceSuccess] = useState(false);

  const handleMatchSelect = (id: string) => {
    setSelectedMatchId(id);
    const m = matches.find(match => match.id === id);
    if (m) {
      setVipPrice(m.ticketPriceVIP.toString());
      setPremPrice(m.ticketPricePremium.toString());
      setGenPrice(m.ticketPriceGeneral.toString());
    }
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;
    const pricePayload = {
      matchId: selectedMatchId,
      vip: parseInt(vipPrice),
      premium: parseInt(premPrice),
      general: parseInt(genPrice),
    };
    dispatch(configureMatchPrice(pricePayload));
    // Broadcast to all user browsers via socket
    socket.emit('admin:config_update', { type: 'configureMatchPrice', data: pricePayload });
    setPriceSuccess(true);
    setTimeout(() => setPriceSuccess(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Page header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            <span>Node Administrator Console</span>
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Global flash sale switches, queue throttles, and match seating adjustments.
          </p>
        </div>

        {/* Global Pause Switch */}
        <button
          onClick={() => {
            dispatch(toggleGlobalSalePause());
            socket.emit('admin:config_update', { type: 'toggleGlobalSalePause', data: {} });
          }}
          className={`flex items-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
            isGlobalSalePaused
              ? 'bg-success hover:opacity-90 text-white shadow-success/15'
              : 'bg-primary hover:opacity-90 text-white shadow-primary/15'
          }`}
        >
          {isGlobalSalePaused ? (
            <>
              <Play className="h-4 w-4" />
              <span>Resume Global Sales</span>
            </>
          ) : (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause Global Sales</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Matches status listing */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
          <h2 className="text-lg font-bold font-display text-gradient-primary flex items-center gap-1.5">
            <Ticket className="h-5 w-5 text-primary" />
            <span>Flash Sale Matches</span>
          </h2>

          <div className="space-y-4">
            {matches.map((m) => (
              <div
                key={m.id}
                onClick={() => handleMatchSelect(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMatchId === m.id
                    ? 'bg-secondary/10 border-secondary'
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-bold truncate max-w-[180px]">{m.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(toggleFlashSale(m.id));
                      socket.emit('admin:config_update', { type: 'toggleFlashSale', data: { matchId: m.id } });
                    }}
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      m.isFlashSaleActive
                        ? 'bg-primary/20 border border-primary/30 text-primary'
                        : 'bg-white/5 border border-white/5 text-foreground/45'
                    }`}
                  >
                    {m.isFlashSaleActive ? 'Live' : 'Locked'}
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-foreground/50 mt-2">
                  <span>Available Seats: {m.availableSeats}</span>
                  <span className="font-semibold text-accent">General: ₹{m.ticketPriceGeneral}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mid Col: Selected Match Settings editor */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 h-fit">
          <h2 className="text-lg font-bold font-display text-gradient-accent flex items-center gap-1.5">
            <Settings className="h-5 w-5 text-accent" />
            <span>Match Price Tuning</span>
          </h2>

          {selectedMatch ? (
            <form onSubmit={handlePriceUpdate} className="space-y-4">
              <div className="text-xs font-bold text-foreground/50 uppercase truncate">
                editing: {selectedMatch.title}
              </div>
              
              <div>
                <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">VIP Pricing (₹)</label>
                <input
                  type="number"
                  required
                  value={vipPrice}
                  onChange={(e) => setVipPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">Premium Pricing (₹)</label>
                <input
                  type="number"
                  required
                  value={premPrice}
                  onChange={(e) => setPremPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/75 uppercase tracking-wide mb-1.5 block">General Pricing (₹)</label>
                <input
                  type="number"
                  required
                  value={genPrice}
                  onChange={(e) => setGenPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-accent to-secondary hover:opacity-95 shadow-md shadow-accent/15 transition-all flex justify-center items-center gap-1.5 uppercase tracking-widest font-display"
              >
                {priceSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Prices Saved</span>
                  </>
                ) : (
                  <span>Update Prices</span>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8 text-foreground/45 text-sm">
              Select a match on the left to configure pricing details.
            </div>
          )}
        </div>

        {/* Right Col: Simulation Controls & Load Tuning */}
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
          <h2 className="text-lg font-bold font-display text-gradient-vip flex items-center gap-1.5">
            <Sliders className="h-5 w-5 text-secondary" />
            <span>Simulation Parameters</span>
          </h2>

          {/* Queue Speed slider */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-foreground/75 uppercase tracking-wide flex items-center gap-1">
                <Users className="h-4 w-4 text-secondary" /> Queue Process Speed
              </span>
              <span className="text-secondary">{simulatedQueueSpeed} users/s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={simulatedQueueSpeed}
              onChange={(e) => {
                const speed = Number(e.target.value);
                dispatch(adjustQueueSpeed(speed));
                socket.emit('admin:config_update', { type: 'adjustQueueSpeed', data: { speed } });
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            <span className="text-[10px] text-foreground/45 block leading-normal">
              Controls how fast users waiting in the virtual waiting room are popped from the queue and redirected to seating selection.
            </span>
          </div>

          {/* Manual Stock Replenishment widget */}
          {selectedMatch && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <span className="text-xs font-bold text-foreground/75 uppercase tracking-wide block">Manual Ticket Replenishment</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    dispatch(updateAvailableSeats({ matchId: selectedMatch.id, delta: 50 }));
                    socket.emit('admin:config_update', { type: 'updateAvailableSeats', data: { matchId: selectedMatch.id, delta: 50 } });
                  }}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-foreground/80 transition-all"
                >
                  Add +50 Seats
                </button>
                <button
                  onClick={() => {
                    dispatch(updateAvailableSeats({ matchId: selectedMatch.id, delta: -50 }));
                    socket.emit('admin:config_update', { type: 'updateAvailableSeats', data: { matchId: selectedMatch.id, delta: -50 } });
                  }}
                  className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-foreground/80 transition-all"
                >
                  Subtract -50 Seats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
