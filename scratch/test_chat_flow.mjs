async function test() {
  const loginRes = await fetch('http://localhost:3001/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', otp: '123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log('Merchant logged in. Token acquired.');

  // Test sendChatMessage with { ok: true, reply: ... }
  const res = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ text: 'Mera paisa kam kyun aaya, pura hisaab samjhao', lang: 'hinglish' })
  });

  const rawJson = await res.json();
  const wrapped = { ok: res.ok, ...rawJson };

  console.log('HTTP Status:', res.status, 'res.ok:', res.ok);
  console.log('wrapped.ok:', wrapped.ok);
  console.log('wrapped.reply (excerpt):', wrapped.reply ? wrapped.reply.slice(0, 100) + '...' : 'UNDEFINED');
  console.log('Check ((wrapped.ok || wrapped.reply) && wrapped.reply) ->', Boolean((wrapped.ok || wrapped.reply) && wrapped.reply));
}

test().catch(console.error);

