type SocketCallback = (data: any) => void;

class SocketSimulator {
  private listeners: Record<string, SocketCallback[]> = {};
  private seatLockInterval: any = null;
  private queueInterval: any = null;
  private tickerInterval: any = null;
  private activeLocks: string[] = [];

  constructor() {
    // Generate initial locks
    this.activeLocks = ['A-VIP-2', 'B-PREM-4', 'B-PREM-18', 'C-GEN-8', 'C-GEN-42', 'C-GEN-99'];
  }

  public connect() {
    console.log('[Socket] Connected to simulated Socket.io server.');
    this.startSeatLockSimulation();
    this.startTickerSimulation();
  }

  public disconnect() {
    console.log('[Socket] Disconnected.');
    this.stopAllSimulation();
  }

  public on(event: string, callback: SocketCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: SocketCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  public emit(event: string, data: any) {
    console.log(`[Socket Client -> Server] Event: ${event}`, data);
    
    // Simulate server side handling
    if (event === 'request_queue_join') {
      this.startQueueSimulation(data.matchId);
    } else if (event === 'lock_seat_attempt') {
      const { seatId, matchId } = data;
      // 90% chance of success, 10% chance seat is already locked
      setTimeout(() => {
        if (this.activeLocks.includes(seatId)) {
          this.trigger('lock_seat_failed', { seatId, reason: 'Seat already locked by another user' });
        } else {
          this.activeLocks.push(seatId);
          this.trigger('lock_seat_success', { seatId, matchId });
          // notify others
          this.trigger('seat_locked', { seatId, lockedBy: 'other-usr' });
        }
      }, 500);
    } else if (event === 'unlock_seat_attempt') {
      const { seatId } = data;
      this.activeLocks = this.activeLocks.filter(s => s !== seatId);
      this.trigger('seat_unlocked', { seatId });
    }
  }

  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  private startSeatLockSimulation() {
    if (this.seatLockInterval) return;

    this.seatLockInterval = setInterval(() => {
      // randomly lock or unlock a seat to show live feedback
      const categories = ['A-VIP', 'B-PREM', 'C-GEN'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const num = Math.floor(Math.random() * 100) + 1;
      const seatId = `${cat}-${num}`;

      const isLocking = Math.random() > 0.4; // 60% chance to lock, 40% to unlock

      if (isLocking) {
        if (!this.activeLocks.includes(seatId)) {
          this.activeLocks.push(seatId);
          this.trigger('seat_locked', { seatId, lockedBy: 'other-user' });
        }
      } else {
        if (this.activeLocks.length > 3) {
          const unlockedSeat = this.activeLocks[Math.floor(Math.random() * this.activeLocks.length)];
          this.activeLocks = this.activeLocks.filter(s => s !== unlockedSeat);
          this.trigger('seat_unlocked', { seatId: unlockedSeat });
        }
      }
    }, 3000);
  }

  private startQueueSimulation(matchId: string) {
    if (this.queueInterval) clearInterval(this.queueInterval);
    
    let position = Math.floor(Math.random() * 150) + 50; // starts between 50 and 200
    let eta = Math.ceil(position / 3); // 3 users per second

    this.trigger('queue_update', { position, eta });

    this.queueInterval = setInterval(() => {
      if (position <= 0) {
        clearInterval(this.queueInterval);
        this.trigger('queue_passed', { matchId });
      } else {
        const decrement = Math.floor(Math.random() * 4) + 1; // decrement by 1-4
        position = Math.max(0, position - decrement);
        eta = Math.ceil(position / 3);
        this.trigger('queue_update', { position, eta });
      }
    }, 1000);
  }

  private startTickerSimulation() {
    if (this.tickerInterval) return;

    const names = ['Amit S.', 'Rahul K.', 'Priya M.', 'Sachin T.', 'Nisha P.', 'Rohan G.', 'Vikram D.', 'Sneha J.'];
    const stands = ['North Stand', 'VIP Box A', 'Premium Block B', 'East Stand'];

    this.tickerInterval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)];
      const stand = stands[Math.floor(Math.random() * stands.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;

      this.trigger('live_sale_ticker', {
        message: `🔥 ${name} just booked ${quantity} tickets for ${stand}!`,
        timestamp: Date.now()
      });
    }, 6000);
  }

  private stopAllSimulation() {
    if (this.seatLockInterval) clearInterval(this.seatLockInterval);
    if (this.queueInterval) clearInterval(this.queueInterval);
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    this.seatLockInterval = null;
    this.queueInterval = null;
    this.tickerInterval = null;
  }
}

export const socket = new SocketSimulator();
