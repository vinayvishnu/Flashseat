import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice';
import adminReducer from './adminSlice';
import { iplApi } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    admin: adminReducer,
    [iplApi.reducerPath]: iplApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(iplApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
