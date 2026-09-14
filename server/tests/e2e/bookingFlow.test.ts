import assert from 'assert';
import { io as Client } from 'socket.io-client';

const BASE_URL = 'http://localhost:5000/api/v1';
const SOCKET_URL = 'http://localhost:5000';

async function runE2EBookingFlow() {
  console.log('🏁 Starting E2E Booking & Saga Flow Test...');

  try {
    // 1. Authenticate user
    console.log('⏳ 1. Authenticating user...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'user123',
      }),
    });
    const loginData = await loginRes.json() as any;
    const token = loginData.data.token;

    // 2. Fetch matches/events to book
    console.log('⏳ 2. Fetching matches...');
    const eventsRes = await fetch(`${BASE_URL}/events`);
    const eventsData = await eventsRes.json() as any;
    const eventId = eventsData.data[0]._id;

    // 3. Request a seat lock (Saga payment starts)
    // Avoid ending with "09" so that payment succeeds
    const seatNumber = `A-VIP-${Math.floor(Math.random() * 20) + 1}`; 
    console.log(`⏳ 3. Locking seat ${seatNumber} for event ${eventId}...`);
    const lockRes = await fetch(`${BASE_URL}/booking/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId, seatNumber }),
    });

    const lockData = await lockRes.json() as any;
    assert.strictEqual(lockRes.status, 202, 'Booking request should be accepted (202)');
    const bookingId = lockData.data.bookingId;
    console.log(`✅ Lock confirmed. Booking ID created: ${bookingId}`);

    // 4. Connect to Socket.io and listen for real-time Kafka Saga updates
    console.log('⏳ 4. Connecting client Socket.io and joining room...');
    const socket = Client(SOCKET_URL);

    socket.on('connect', () => {
      console.log(`📡 Socket connected. Requesting to join room ${bookingId}...`);
      socket.emit('join', bookingId);
    });

    // Wait for the Saga updates
    let isSagaFinished = false;

    socket.on('booking:progress', (data: { bookingId: string; status: string; message: string }) => {
      console.log(`🔔 Received Progress Alert: [${data.status}] - ${data.message}`);
      
      if (data.status === 'CONFIRMED') {
        console.log('✅ Success! Ticket confirmed in database.');
        isSagaFinished = true;
        socket.disconnect();
        cleanupLock(eventId, seatNumber);
      } else if (data.status === 'FAILED') {
        console.log('❌ Failure! Saga transaction rolled back.');
        isSagaFinished = true;
        socket.disconnect();
      }
    });

    // Timeout safety
    setTimeout(() => {
      if (!isSagaFinished) {
        console.error('❌ E2E Timeout: Did not receive final status update from worker.');
        socket.disconnect();
        process.exit(1);
      }
    }, 6000);

  } catch (error) {
    console.error('❌ E2E Test Failure:', error);
    process.exit(1);
  }
}

// Quick helper to unlock seat after verification so we don't pollute database with sold seats during tests
async function cleanupLock(eventId: string, seatNumber: string) {
  // Optional cleanup block if needed
  console.log('🎉 E2E BOOKING FLOW TEST PASSED SUCCESSFULLY!');
  process.exit(0);
}

runE2EBookingFlow();
