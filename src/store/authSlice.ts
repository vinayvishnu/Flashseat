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
    matchId: '60d5ecb8b311234567890300',
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

const getInitialState = (): AuthState => {
  try {
    // Using sessionStorage so each browser tab has its own independent session.
    // This allows Tab 1 (User) and Tab 2 (Admin) to coexist without overwriting
    // each other, and each tab's session survives a page refresh.
    const storedUser = sessionStorage.getItem('user');
    const storedToken = sessionStorage.getItem('token');
    if (storedUser && storedToken) {
      return {
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        tickets: initialTickets,
        loading: false,
        error: null,
      };
    }
  } catch (e) {
    console.error('Failed to parse auth state', e);
  }
  return {
    user: null,
    isAuthenticated: false,
    tickets: initialTickets,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      sessionStorage.setItem('user', JSON.stringify(action.payload));
      sessionStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.tickets = [];
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
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
