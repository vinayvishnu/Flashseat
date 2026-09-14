import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/index';
import redis from '../src/config/redis';
import { producer } from '../src/config/kafka';

describe('FlashSeat REST API Integration Test Suite', () => {
  let token: string;
  let eventId: string;
  const testEmail = `jest_test_${Date.now()}@flashseat.com`;
  const testPassword = 'Password123!';

  // Wait for connections to be active before running tests
  beforeAll(async () => {
    // Wait up to 5 seconds for Mongoose to connect
    let retries = 5;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retries--;
    }
  });

  // Close connections so Jest can exit cleanly
  afterAll(async () => {
    await mongoose.connection.close();
    await redis.quit();
    try {
      await producer.disconnect();
    } catch (e) {}
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jest Tester',
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe(testEmail);
    });

    it('should fail to register a user with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jest Tester Duplicate',
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should authenticate user and return token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      token = res.body.data.token;
    });

    it('should retrieve authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testEmail);
    });

    it('should block profile requests with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Events & Seat Map Endpoints', () => {
    it('should fetch matches list', async () => {
      const res = await request(app).get('/api/v1/events');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      if (res.body.data.length > 0) {
        eventId = res.body.data[0]._id;
      }
    });

    it('should fetch seat map for selected match', async () => {
      if (!eventId) {
        console.warn('Skipping seat map test: no eventId found (DB might not be seeded)');
        return;
      }
      
      const res = await request(app).get(`/api/v1/events/${eventId}/seats`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
