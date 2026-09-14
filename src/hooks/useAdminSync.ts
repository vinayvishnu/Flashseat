import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socket } from '../services/socket';
import {
  toggleFlashSale,
  toggleGlobalSalePause,
  adjustQueueSpeed,
  updateAvailableSeats,
  configureMatchPrice,
} from '../store/adminSlice';

/**
 * useAdminSync - mounts globally in App.tsx.
 *
 * Listens for 'admin:config_applied' socket events broadcast by the server
 * whenever an admin performs a configuration change. Dispatches the matching
 * Redux action so every connected browser tab (users) sees admin changes
 * in real-time without needing a page refresh.
 */
export const useAdminSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Ensure socket is connected for all pages (not just booking flow pages)
    socket.connect();

    const handler = (payload: { type: string; data: any }) => {
      console.log('[AdminSync] Received admin config update:', payload.type);

      switch (payload.type) {
        case 'toggleFlashSale':
          dispatch(toggleFlashSale(payload.data.matchId));
          break;
        case 'toggleGlobalSalePause':
          dispatch(toggleGlobalSalePause());
          break;
        case 'adjustQueueSpeed':
          dispatch(adjustQueueSpeed(payload.data.speed));
          break;
        case 'updateAvailableSeats':
          dispatch(
            updateAvailableSeats({
              matchId: payload.data.matchId,
              delta: payload.data.delta,
            })
          );
          break;
        case 'configureMatchPrice':
          dispatch(
            configureMatchPrice({
              matchId: payload.data.matchId,
              vip: payload.data.vip,
              premium: payload.data.premium,
              general: payload.data.general,
            })
          );
          break;
        default:
          console.warn('[AdminSync] Unknown config type:', payload.type);
      }
    };

    socket.on('admin:config_applied', handler);

    return () => {
      socket.off('admin:config_applied', handler);
    };
  }, [dispatch]);
};
