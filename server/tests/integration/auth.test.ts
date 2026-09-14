import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runAuthTests() {
  console.log('🏁 Starting Authentication Integration Tests...');

  const testUser = {
    name: 'Automation Tester',
    email: `tester_${Date.now()}@flashseat.com`,
    password: 'SecurePassword123!',
  };

  try {
    // 1. Test Registration
    console.log('⏳ 1. Testing POST /auth/register...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    
    const registerData = await registerRes.json() as any;
    assert.strictEqual(registerRes.status, 201, 'Registration should return 201 Created');
    assert.strictEqual(registerData.success, true, 'Response success should be true');
    assert.ok(registerData.data.token, 'Should return JWT token');
    assert.strictEqual(registerData.data.email, testUser.email, 'Emails should match');
    console.log('✅ Registration test passed!');

    // 2. Test Login
    console.log('⏳ 2. Testing POST /auth/login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginRes.json() as any;
    assert.strictEqual(loginRes.status, 200, 'Login should return 200 OK');
    assert.strictEqual(loginData.success, true, 'Response success should be true');
    assert.ok(loginData.data.token, 'Login should return JWT token');
    console.log('✅ Login test passed!');

    const token = loginData.data.token;

    // 3. Test Profile Retrieve (/auth/me)
    console.log('⏳ 3. Testing GET /auth/me (Authenticated)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const meData = await meRes.json() as any;
    assert.strictEqual(meRes.status, 200, '/auth/me should return 200 OK');
    assert.strictEqual(meData.data.email, testUser.email, 'Profile email should match logged in user');
    console.log('✅ Profile retrieval test passed!');

    // 4. Test Unauthenticated Request Block
    console.log('⏳ 4. Testing GET /auth/me (Unauthenticated request check)...');
    const badMeRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
    });
    assert.strictEqual(badMeRes.status, 401, 'Unauthenticated request should return 401 Unauthorized');
    console.log('✅ Security guard test passed!');

    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Integration Test Failure:', error);
    process.exit(1);
  }
}

runAuthTests();
