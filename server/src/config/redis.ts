import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Initialize ioredis client
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Critical requirement for compatibility with some queue libraries like BullMQ
});

redis.on('connect', () => {
  console.log('⚡ Redis Connected successfully.');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redis;
