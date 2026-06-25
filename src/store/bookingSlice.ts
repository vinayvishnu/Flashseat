import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Match {
  id: string;
  title: string;
  teams: {
    home: { name: string; short: string; logo: string; color: string };
    away: { name: string; short: string; logo: string; color: string };
  };
  time: string;
  stadium: string;
  ticketPriceVIP: number;
  ticketPricePremium: number;
  ticketPriceGeneral: number;
  totalSeats: number;
  availableSeats: number;
  isFlashSaleActive: boolean;
  flashSaleStartTime: string;
}

export interface LockedSeat {
  seatId: string;
  lockedBy: string; // userId
  expiresAt: number; // timestamp
}

interface BookingState {
  selectedMatchId: string | null;
  selectedSeats: string[];
  lockedSeatsByOthers: string[]; // List of seat IDs locked by other users
  bookedSeats: string[]; // List of seat IDs already booked
  queueStatus: 'idle' | 'waiting' | 'passed' | 'failed';
  queuePosition: number;
  queueEta: number; // in seconds
  bookingStep: 'browse' | 'waiting' | 'selection' | 'details' | 'payment' | 'success';
  checkoutTimer: number; // in seconds (e.g. 5 minutes/300s to check out)
  paymentProcessing: boolean;
  paymentSuccess: boolean;
}

const initialState: BookingState = {
  selectedMatchId: null,
  selectedSeats: [],
  lockedSeatsByOthers: ['A-VIP-1', 'A-VIP-2', 'B-PREM-4', 'B-PREM-5', 'C-GEN-10', 'C-GEN-11', 'C-GEN-12'],
  bookedSeats: ['A-VIP-5', 'A-VIP-6', 'B-PREM-20', 'C-GEN-50', 'C-GEN-51'],
  queueStatus: 'idle',
  queuePosition: 0,
  queueEta: 0,
  bookingStep: 'browse',
  checkoutTimer: 0,
  paymentProcessing: false,
  paymentSuccess: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedMatch: (state, action: PayloadAction<string | null>) => {
      state.selectedMatchId = action.payload;
    },
    toggleSeatSelection: (state, action: PayloadAction<string>) => {
      const seat = action.payload;
      if (state.selectedSeats.includes(seat)) {
        state.selectedSeats = state.selectedSeats.filter(s => s !== seat);
      } else {
        // limit selection to booking limit (e.g., 4 seats)
        if (state.selectedSeats.length < 4) {
          state.selectedSeats.push(seat);
        }
      }
    },
    clearSeatSelection: (state) => {
      state.selectedSeats = [];
    },
    lockSeatsExternally: (state, action: PayloadAction<string[]>) => {
      // Add dynamically locked seats by other players (simulate socket updates)
      state.lockedSeatsByOthers = Array.from(new Set([...state.lockedSeatsByOthers, ...action.payload]));
    },
    unlockSeatsExternally: (state, action: PayloadAction<string[]>) => {
      state.lockedSeatsByOthers = state.lockedSeatsByOthers.filter(s => !action.payload.includes(s));
    },
    setBookedSeats: (state, action: PayloadAction<string[]>) => {
      state.bookedSeats = Array.from(new Set([...state.bookedSeats, ...action.payload]));
    },
    setQueueStatus: (state, action: PayloadAction<BookingState['queueStatus']>) => {
      state.queueStatus = action.payload;
    },
    updateQueue: (state, action: PayloadAction<{ position: number; eta: number }>) => {
      state.queuePosition = action.payload.position;
      state.queueEta = action.payload.eta;
    },
    setBookingStep: (state, action: PayloadAction<BookingState['bookingStep']>) => {
      state.bookingStep = action.payload;
    },
    startCheckoutTimer: (state, action: PayloadAction<number>) => {
      state.checkoutTimer = action.payload;
    },
    tickCheckoutTimer: (state) => {
      if (state.checkoutTimer > 0) {
        state.checkoutTimer -= 1;
      }
    },
    setPaymentProcessing: (state, action: PayloadAction<boolean>) => {
      state.paymentProcessing = action.payload;
    },
    setPaymentSuccess: (state, action: PayloadAction<boolean>) => {
      state.paymentSuccess = action.payload;
    },
    resetBooking: (state) => {
      state.selectedSeats = [];
      state.queueStatus = 'idle';
      state.queuePosition = 0;
      state.queueEta = 0;
      state.bookingStep = 'browse';
      state.checkoutTimer = 0;
      state.paymentProcessing = false;
      state.paymentSuccess = false;
    }
  }
});

export const {
  setSelectedMatch,
  toggleSeatSelection,
  clearSeatSelection,
  lockSeatsExternally,
  unlockSeatsExternally,
  setBookedSeats,
  setQueueStatus,
  updateQueue,
  setBookingStep,
  startCheckoutTimer,
  tickCheckoutTimer,
  setPaymentProcessing,
  setPaymentSuccess,
  resetBooking
} = bookingSlice.actions;

export default bookingSlice.reducer;
