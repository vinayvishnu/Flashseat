import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  matchId: string;
  matchTitle: string;
  matchTime: string;
  stadiumName: string;
  seats: string[];
  totalPaid: number;
  status: 'confirmed' | 'pending';
  qrCode: string;
  bookingDate: string;
  gateNo: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  bookingLimit: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialTickets: Ticket[] = [
  {
    id: 'TXN-IPL-2026-9821',
    matchId: 'match-1',
    matchTitle: 'Mumbai Indians vs Chennai Super Kings',
    matchTime: 'May 12, 2026 - 19:30 IST',
    stadiumName: 'Wankhede Stadium, Mumbai',
    seats: ['A-VIP-12', 'A-VIP-13'],
    totalPaid: 15000,
    status: 'confirmed',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TXN-IPL-2026-9821-MI-CSK',
    bookingDate: '2026-05-10T14:22:10Z',
    gateNo: 'Gate 3, North Stand',
  }
];

const initialState: AuthState = {
  user: {
    id: 'usr-4482',
    name: 'Vinay Kumar',
    email: 'vinay@flashseat.ai',
    role: 'user',
    walletBalance: 25000,
    bookingLimit: 4,
  },
  isAuthenticated: true,
  tickets: initialTickets,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.tickets = [];
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateWallet: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.walletBalance = action.payload;
      }
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      state.tickets.unshift(action.payload);
      if (state.user) {
        state.user.walletBalance -= action.payload.totalPaid;
      }
    },
  },
});

export const { loginSuccess, logout, updateProfile, updateWallet, addTicket } = authSlice.actions;
export default authSlice.reducer;
