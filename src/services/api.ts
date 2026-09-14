import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Match } from '../store/bookingSlice';

// Helper to convert backend event payload to Match interface
const mapEventToMatch = (event: any): Match => {
  const homeTeamName = event.title.includes('vs') ? event.title.split(' vs ')[0] : 'Home Team';
  const awayTeamName = event.title.includes('vs') ? event.title.split(' vs ')[1] : 'Away Team';

  const homeShort = homeTeamName.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase();
  const awayShort = awayTeamName.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase();

  return {
    id: event._id,
    title: event.title,
    teams: {
      home: { name: homeTeamName, short: homeShort, logo: '⚡', color: '#004BA0' },
      away: { name: awayTeamName, short: awayShort, logo: '🦁', color: '#FDB913' }
    },
    time: new Date(event.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' IST',
    stadium: event.stadiumId?.name || 'Stadium',
    ticketPriceVIP: event.basePrice * 3,
    ticketPricePremium: Math.round(event.basePrice * 1.8),
    ticketPriceGeneral: event.basePrice,
    totalSeats: 204, // 24 VIP + 60 Prem + 120 Gen
    availableSeats: 204,
    isFlashSaleActive: true,
    flashSaleStartTime: event.date,
  };
};

export const iplApi = createApi({
  reducerPath: 'iplApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1',
    prepareHeaders: (headers) => {
      // Read from sessionStorage (per-tab) to match where authSlice stores the token.
      // This allows separate admin/user sessions in different tabs.
      const token = sessionStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Match', 'Ticket', 'Seat'],
  endpoints: (builder) => ({
    getMatches: builder.query<Match[], void>({
      query: () => '/events',
      transformResponse: (response: { success: boolean; data: any[] }) => {
        return response.data.map(mapEventToMatch);
      },
      providesTags: ['Match'],
    }),
    getMatchById: builder.query<Match, string>({
      query: (id) => `/events/${id}`,
      transformResponse: (response: { success: boolean; data: any }) => {
        return mapEventToMatch(response.data);
      },
      providesTags: (_result, _error, id) => [{ type: 'Match', id }],
    }),
    getEventSeats: builder.query<any[], string>({
      query: (id) => `/events/${id}/seats`,
      transformResponse: (response: { success: boolean; data: any[] }) => {
        return response.data;
      },
      providesTags: ['Seat'],
    }),
    startBooking: builder.mutation<
      { success: boolean; data: { bookingId: string; eventId: string; seatNumber: string; message: string } },
      { eventId: string; seatNumber: string }
    >({
      query: (body) => ({
        url: '/booking/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Seat'],
    }),
  }),
});

export const { 
  useGetMatchesQuery, 
  useGetMatchByIdQuery, 
  useGetEventSeatsQuery,
  useStartBookingMutation 
} = iplApi;
export default iplApi;
