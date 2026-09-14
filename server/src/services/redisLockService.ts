import redis from '../config/redis';

/**
 * Service to manage distributed locks on seats using Redis
 */
export const acquireLock = async (
  eventId: string,
  seatNumber: string,
  userId: string,
  ttlMs: number = 300000 // 5 minutes default
): Promise<boolean> => {
  const lockKey = `lock:seat:${eventId}:${seatNumber}`;
  
  // SET key value NX PX ttlMs
  // NX: only set if key doesn't exist
  // PX: set expiry in milliseconds
  const result = await redis.set(lockKey, userId, 'NX', 'PX', ttlMs);
  
  return result === 'OK';
};

/**
 * Release a seat lock using a Lua script to ensure atomicity.
 * The lock is only released if the value (userId) matches the one who created it.
 */
export const releaseLock = async (
  eventId: string,
  seatNumber: string,
  userId: string
): Promise<boolean> => {
  const lockKey = `lock:seat:${eventId}:${seatNumber}`;
  
  // Lua script: check if value matches userId, if yes delete key, else do nothing.
  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  const result = await redis.eval(luaScript, 1, lockKey, userId);
  return result === 1;
};
