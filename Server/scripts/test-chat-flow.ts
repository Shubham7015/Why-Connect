
// import { fetch } from 'undici';
export {};

const BASE_URL = 'http://localhost:8000/api';

async function testChatFlow() {
  const timestamp = Date.now();
  
  // User A
  const userA = {
    name: `User A ${timestamp}`,
    email: `usera${timestamp}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
  };

  // User B
  const userB = {
    name: `User B ${timestamp}`,
    email: `userb${timestamp}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
  };

  console.log('--- Starting Chat API Test ---');

  // Helper to register and get cookie + user info
  async function registerUser(user: any, label: string) {
    console.log(`\nRegistering ${label}: ${user.email}`);
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to register ${label}: ${res.status} ${txt}`);
    }
    
    const data = await res.json();
    const cookie = res.headers.get('set-cookie')?.split(';')[0];
    console.log(`${label} Registered. ID: ${data.user._id}`);
    return { data, cookie };
  }

  try {
    // 1. Register Users
    const regA = await registerUser(userA, 'User A');
    const regB = await registerUser(userB, 'User B');

    const tokenA = regA.cookie;
    const tokenB = regB.cookie; // Not strictly needed for A to start chat, but good to have.
    const userBId = regB.data.user._id;

    if (!tokenA) throw new Error("User A has no cookie!");

    // 2. Create Chat (A starts chat with B)
    console.log(`\n2. User A creating chat with User B (${userBId})...`);
    const createRes = await fetch(`${BASE_URL}/chat/create`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': tokenA 
        },
        body: JSON.stringify({
            participantId: userBId
        })
    });

    if (!createRes.ok) {
        const txt = await createRes.text();
        console.error(`Create Chat Failed: ${createRes.status} ${txt}`);
        return;
    }

    const createData = await createRes.json();
    console.log('Chat Created/Retrieved:', createData);
    const chatId = createData.chat._id;

    // 3. Get All Chats for User A
    console.log(`\n3. User A fetching all chats...`);
    const allChatsRes = await fetch(`${BASE_URL}/chat/all`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': tokenA 
        },
    });

    if (!allChatsRes.ok) {
        const txt = await allChatsRes.text();
        console.error(`Get All Chats Failed: ${allChatsRes.status} ${txt}`);
        return;
    }

    const allChatsData = await allChatsRes.json();
    console.log(`User A has ${allChatsData.chats ? allChatsData.chats.length : 0} chats.`);
    
    // Verify our chat is there
    const foundChat = allChatsData.chats.find((c: any) => c._id === chatId);
    if (foundChat) {
        console.log('Verified: The new chat ID is present in the list.');
    } else {
        console.error('Error: New chat ID NOT found in the list.');
    }

    // 4. Get Single Chat
    console.log(`\n4. User A fetching single chat ${chatId}...`);
    const singleChatRes = await fetch(`${BASE_URL}/chat/${chatId}`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': tokenA 
        },
    });

    if (!singleChatRes.ok) {
        const txt = await singleChatRes.text();
        console.error(`Get Single Chat Failed: ${singleChatRes.status} ${txt}`);
        return;
    }

    const singleChatData = await singleChatRes.json();
    console.log('Single Chat Data Retrieved successfully.');
    // console.log(JSON.stringify(singleChatData, null, 2));

  } catch (err) {
      console.error('Test Failed:', err);
  }
}

testChatFlow();
