import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Match } from '../store/bookingSlice';

// Simulated match repository
let mockMatches: Match[] = [
  {
    id: 'match-1',
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
    id: 'match-2',
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
    id: 'match-3',
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

export const iplApi = createApi({
  reducerPath: 'iplApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Match', 'Ticket'],
  endpoints: (builder) => ({
    getMatches: builder.query<Match[], void>({
      queryFn: async () => {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 800));
        return { data: mockMatches };
      },
      providesTags: ['Match'],
    }),
    getMatchById: builder.query<Match, string>({
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const match = mockMatches.find((m) => m.id === id);
        if (!match) {
          return { error: { status: 404, statusText: 'Match Not Found', data: null } };
        }
        return { data: match };
      },
      providesTags: (_result, _error, id) => [{ type: 'Match', id }],
    }),
    purchaseTickets: builder.mutation<
      { success: boolean; transactionId: string; ticketsBooked: string[] },
      { matchId: string; seats: string[]; totalAmount: number; paymentDetails: any }
    >({
      queryFn: async ({ matchId, seats, totalAmount }) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment processing delay
        
        // update local stock
        const match = mockMatches.find((m) => m.id === matchId);
        if (match) {
          match.availableSeats = Math.max(0, match.availableSeats - seats.length);
        }

        const transactionId = `TXN-IPL-${Date.now().toString().slice(-6)}`;
        return {
          data: {
            success: true,
            transactionId,
            ticketsBooked: seats,
          },
        };
      },
      invalidatesTags: ['Match'],
    }),
  }),
});

export const { useGetMatchesQuery, useGetMatchByIdQuery, usePurchaseTicketsMutation } = iplApi;
export default iplApi;
