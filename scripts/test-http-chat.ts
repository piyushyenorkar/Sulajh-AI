import 'dotenv/config';

async function testHttp() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@kirana.in', password: 'Password123!' }),
  });
  const loginData = await loginRes.json() as any;

  // Test 1: with case-3 (which belongs to merch-3 Ganesh)
  const chatRes1 = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({
      text: 'Customer dispute aaya hai 8500 ka, proof submit karo',
      case_id: 'case-3',
      lang: 'hinglish',
    }),
  });
  console.log('Case-3 (Forbidden?): Status', chatRes1.status, await chatRes1.json());
}

testHttp();
