import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runConcurrencyLockTest() {
  console.log('🏁 Starting Concurrency & Distributed Lock Race Condition Tests...');

  try {
    // 1. Authenticate user to get authorization token
    console.log('⏳ 1. Authenticating test runner...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@example.com',
        password: 'user123',
      }),
    });
    const loginData = await loginRes.json() as any;
    if (!loginData.success) {
      throw new Error(`Authentication failed: ${loginData.error}`);
    }
    const token = loginData.data.token;

    // 2. Fetch matches/events to get an event ID
    console.log('⏳ 2. Fetching event configuration...');
    const eventsRes = await fetch(`${BASE_URL}/events`);
    const eventsData = await eventsRes.json() as any;
    if (!eventsData.success || eventsData.data.length === 0) {
      throw new Error('No events found in the database. Please run the seed script first.');
    }
    const eventId = eventsData.data[0]._id;

    // 3. Select a target seat number to lock concurrently
    const seatNumber = `C-GEN-${Math.floor(Math.random() * 50) + 20}`;
    console.log(`⏳ 3. Launching 10 parallel booking requests for seat ${seatNumber} in event ${eventId}...`);

    const requestPromises = Array.from({ length: 10 }, () =>
      fetch(`${BASE_URL}/booking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, seatNumber }),
      })
    );

    const responses = await Promise.all(requestPromises);

    // 4. Assert responses
    let successfulRequests = 0;
    let lockedRequests = 0;

    for (const res of responses) {
      const data = await res.json() as any;
      if (res.status === 202 && data.success) {
        successfulRequests++;
      } else if (res.status === 409 && !data.success) {
        lockedRequests++;
      } else {
        console.log(`⚠️ Unexpected response status ${res.status}:`, data);
      }
    }

    console.log('\n📊 Concurrency Race Results:');
    console.log(`🔹 Successful (Acquired Redis Lock): ${successfulRequests}`);
    console.log(`🔸 Blocked (Rejected by Redis Lock): ${lockedRequests}`);

    assert.strictEqual(successfulRequests, 1, 'Exactly one concurrent request must acquire the Redis lock');
    assert.strictEqual(lockedRequests, 9, 'Remaining 9 concurrent requests must fail with a 409 status code');

    console.log('✅ Distributed Lock Concurrency Test Passed!');
  } catch (error) {
    console.error('❌ Concurrency Test Failure:', error);
    process.exit(1);
  }
}

runConcurrencyLockTest();
