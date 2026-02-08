
export {};
const BASE_URL = 'http://localhost:8000/api';

async function apiCall(method: 'GET' | 'POST', path: string, body?: any, cookie?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  console.log(`\n--- ${method} ${path} ---`);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      console.log('Set-Cookie:', setCookie);
      // Extract the cookie part we need (accessToken=...)
      const cookieMatch = setCookie.match(/(accessToken=[^;]+)/);
      return cookieMatch ? cookieMatch[1] : null;
    }
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function runTests() {
  const timestamp = Date.now();
  const testUser = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
  };

  // 1. Health Check (if exists) or just base test
  // 2. Register
  console.log('1. Testing Register...');
  let cookie = await apiCall('POST', '/auth/register', testUser);

  if (!cookie) {
    console.log('Register failed to return cookie. Trying login...');
  } else {
    console.log('Register successful, cookie received.');
  }

  // 3. Login
  console.log('2. Testing Login...');
  const loginCookie = await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });

  if (loginCookie) {
    cookie = loginCookie;
    console.log('Login successful, cookie received.');
  }

  if (!cookie) {
    console.error('No cookie received. Skipping auth tests.');
    return;
  }

  // 4. Status
  console.log('3. Testing Auth Status...');
  await apiCall('GET', '/auth/status', undefined, cookie);

  // 5. Logout
  console.log('4. Testing Logout...');
  await apiCall('POST', '/auth/logout', undefined, cookie);

  // 6. Status after logout (Simulate client clearing cookie)
  console.log('5. Testing Auth Status after logout (No Cookie)...');
  await apiCall('GET', '/auth/status'); // No cookie passed

  // 7. Login with wrong password
  console.log('6. Testing Login with wrong password...');
  await apiCall('POST', '/auth/login', {
    email: testUser.email,
    password: 'wrongpassword',
  });
}

runTests();
