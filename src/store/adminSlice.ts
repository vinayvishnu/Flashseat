import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Match } from './bookingSlice';

interface AdminState {
  matches: Match[];
  isGlobalSalePaused: boolean;
  systemTraffic: 'low' | 'medium' | 'high' | 'peak';
  simulatedQueueSpeed: number; // position decrement rate per second
}

const initialMatches: Match[] = [
  {
    id: '60d5ecb8b311234567890300',
    title: 'Mumbai Indians vs Chennai Super Kings',
    teams: {
      home: { name: 'Mumbai Indians', short: 'MI', logo: '⚡', color: '#004BA0' },
      away: { name: 'Chennai Super Kings', short: 'CSK', logo: '🦁', color: '#FDB913' }
    },
    time: 'May 12, 2026 - 19:30 IST',
    stadium: 'Wankhede Stadium, Mumbai',
    ticketPriceVIP: 7500,
    ticketPricePremium: 3500,
    ticketPriceGeneral: 1500,
    totalSeats: 300,
    availableSeats: 142,
    isFlashSaleActive: true,
    flashSaleStartTime: '2026-06-24T20:00:00Z',
  },
  {
    id: '60d5ecb8b311234567890301',
    title: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
    teams: {
      home: { name: 'Royal Challengers Bengaluru', short: 'RCB', logo: '👑', color: '#EC1C24' },
      away: { name: 'Kolkata Knight Riders', short: 'KKR', logo: '🍇', color: '#3A225D' }
    },
    time: 'May 14, 2026 - 19:30 IST',
    stadium: 'M. Chinnaswamy Stadium, Bengaluru',
    ticketPriceVIP: 8000,
    ticketPricePremium: 4000,
    ticketPriceGeneral: 1800,
    totalSeats: 300,
    availableSeats: 210,
    isFlashSaleActive: false,
    flashSaleStartTime: '2026-06-25T18:00:00Z',
  },
  {
    id: '60d5ecb8b311234567890302',
    title: 'Delhi Capitals vs Rajasthan Royals',
    teams: {
      home: { name: 'Delhi Capitals', short: 'DC', logo: '🐯', color: '#0078BC' },
      away: { name: 'Rajasthan Royals', short: 'RR', logo: '🏛️', color: '#EA1A85' }
    },
    time: 'May 16, 2026 - 19:30 IST',
    stadium: 'Arun Jaitley Stadium, Delhi',
    ticketPriceVIP: 6500,
    ticketPricePremium: 3000,
    ticketPriceGeneral: 1200,
    totalSeats: 300,
    availableSeats: 295,
    isFlashSaleActive: false,
    flashSaleStartTime: '2026-06-27T12:00:00Z',
  }
];

const initialState: AdminState = {
  matches: initialMatches,
  isGlobalSalePaused: false,
  systemTraffic: 'high',
  simulatedQueueSpeed: 3, // users processed per second
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    toggleFlashSale: (state, action: PayloadAction<string>) => {
      const match = state.matches.find(m => m.id === action.payload);
      if (match) {
        match.isFlashSaleActive = !match.isFlashSaleActive;
      }
    },
    toggleGlobalSalePause: (state) => {
      state.isGlobalSalePaused = !state.isGlobalSalePaused;
    },
    setSystemTraffic: (state, action: PayloadAction<AdminState['systemTraffic']>) => {
      state.systemTraffic = action.payload;
    },
    adjustQueueSpeed: (state, action: PayloadAction<number>) => {
      state.simulatedQueueSpeed = action.payload;
    },
    updateAvailableSeats: (state, action: PayloadAction<{ matchId: string; delta: number }>) => {
      const match = state.matches.find(m => m.id === action.payload.matchId);
      if (match) {
        match.availableSeats = Math.max(0, Math.min(match.totalSeats, match.availableSeats + action.payload.delta));
      }
    },
    configureMatchPrice: (state, action: PayloadAction<{ matchId: string; vip: number; premium: number; general: number }>) => {
      const match = state.matches.find(m => m.id === action.payload.matchId);
      if (match) {
        match.ticketPriceVIP = action.payload.vip;
        match.ticketPricePremium = action.payload.premium;
        match.ticketPriceGeneral = action.payload.general;
      }
    }
  }
});

export const {
  toggleFlashSale,
  toggleGlobalSalePause,
  setSystemTraffic,
  adjustQueueSpeed,
  updateAvailableSeats,
  configureMatchPrice
} = adminSlice.actions;

export default adminSlice.reducer;
