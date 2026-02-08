
// import { fetch } from 'undici';
export {};

const BASE_URL = 'http://localhost:8000/api';

async function testMessageFlow() {
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

  console.log('--- Starting Message API Test ---');

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
    // Assuming the cookie is set in the headers
    const cookieHeader = res.headers.get('set-cookie');
    const cookie = cookieHeader ? cookieHeader.split(';')[0] : '';
    console.log(`${label} Registered. ID: ${data.user._id}`);
    return { data, cookie };
  }

  try {
    // 1. Register Users
    const regA = await registerUser(userA, 'User A');
    const regB = await registerUser(userB, 'User B');

    const tokenA = regA.cookie;
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

    // 3. Send Message
    console.log(`\n3. User A sending message to chat ${chatId}...`);
    const messageContent = "Hello from User A!";
    const sendRes = await fetch(`${BASE_URL}/chat/message/send`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': tokenA 
        },
        body: JSON.stringify({
            chatId: chatId,
            content: messageContent
        })
    });

    if (!sendRes.ok) {
        const txt = await sendRes.text();
        console.error(`Send Message Failed: ${sendRes.status} ${txt}`);
        return;
    }

    const sendData = await sendRes.json();
    console.log('Message Sent Successfully!');
    console.log('Response:', JSON.stringify(sendData, null, 2));

    // Validation
    if (sendData.message === "Message sent successfully" && sendData.userMessage && sendData.userMessage.content === messageContent) {
        console.log('\nPASSED: Message sent and response structure is correct.');
    } else {
        console.error('\nFAILED: Response structure is incorrect.');
    }

  } catch (err) {
      console.error('Test Failed:', err);
  }
}

testMessageFlow();
