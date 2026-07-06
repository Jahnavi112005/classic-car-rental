import fetch from 'node-fetch';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.SMOKE_TEST_EMAIL || 'bookings@classiccarrentals.in';
const ADMIN_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'Login@2026';

async function runTest(name, fn) {
  try {
    const result = await fn();
    console.log(`PASS: ${name}`, result || 'OK');
  } catch (error) {
    console.error(`FAIL: ${name}`, error.message || error);
    process.exitCode = 1;
  }
}

async function main() {
  console.log('Smoke test running against:', API_BASE);

  await runTest('Health endpoint', async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.text();
  });

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginRes.ok) throw new Error(`Login status ${loginRes.status}`);
  const loginData = await loginRes.json();
  if (!loginData?.session?.token) throw new Error('No token returned');
  const token = loginData.session.token;
  console.log('PASS: Login token received');

  await runTest('Protected auth/me route', async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return 'OK';
  });

  await runTest('Vehicles list', async () => {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return 'OK';
  });

  await runTest('Bookings list', async () => {
    const res = await fetch(`${API_BASE}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return 'OK';
  });
}

main().catch(error => {
  console.error('Smoke test failed:', error.message || error);
  process.exit(1);
});