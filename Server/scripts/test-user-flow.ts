
//import { fetch } from 'undici'; // Use native fetch

const BASE_URL = 'http://localhost:8000/api';

async function testUserFlow() {
  const timestamp = Date.now();
  const userData = {
    name: `Test User ${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'password123',
    confirmPassword: 'password123' 
  };

  console.log('--- Starting User API Test ---');

  // 1. Register
  console.log(`\n1. Registering user: ${userData.email}`);
  let cookie = '';
  try {
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!registerRes.ok) {
        const errorText = await registerRes.text();
        console.error(`Register failed: ${registerRes.status} ${registerRes.statusText}`, errorText);
        // Verify if it failed because user already exists (unlikely with timestamp)
        return;
    }
    const registerData = await registerRes.json();
    console.log('Register successful:', registerData);

    // Extract cookie
    const setCookie = registerRes.headers.get('set-cookie');
    if (setCookie) {
        console.log('Cookie received from register:', setCookie);
        cookie = setCookie.split(';')[0]; // Simple extraction
    }
  } catch (err) {
    console.error('Register error:', err);
    return;
  }

  // 2. Login (Optional if register logs us in, which it seems to do based on auth.controller.ts)
  // Register controller calls setJwtAuthCookie, so we should be logged in.
  // But let's verify login endpoint too.
  
  console.log(`\n2. Logging in...`);
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userData.email, password: userData.password }),
    });

    if (!loginRes.ok) {
        const errorText = await loginRes.text();
        console.error(`Login failed: ${loginRes.status} ${loginRes.statusText}`, errorText);
        return;
    }
    const loginData = await loginRes.json();
    console.log('Login successful:', loginData);
    
    // Update cookie from login if present
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
        console.log('Cookie received from login:', setCookie);
        cookie = setCookie.split(';')[0];
    }
  } catch (err) {
      console.error('Login error:', err);
      return;
  }

  // 3. Get Users
  console.log(`\n3. Getting all users...`);
  try {
      if (!cookie) {
          console.error('No cookie found, cannot authenticate.');
          return;
      }
      
      const usersRes = await fetch(`${BASE_URL}/user/all`, {
          method: 'GET',
          headers: { 
              'Content-Type': 'application/json',
              'Cookie': cookie 
          },
      });

      if (!usersRes.ok) {
          const errorText = await usersRes.text();
          console.error(`Get Users failed: ${usersRes.status} ${usersRes.statusText}`, errorText);
          return;
      }

      const usersData = await usersRes.json();
      console.log('Get Users successful. Count:', usersData.users ? usersData.users.length : 'Unknown');
      // console.log('Users:', JSON.stringify(usersData, null, 2)); 
      
  } catch (err) {
      console.error('Get Users error:', err);
  }
}

testUserFlow();
