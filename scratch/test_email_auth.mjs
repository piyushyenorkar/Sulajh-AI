async function testAuth() {
  // Test Email
  const resEmail = await fetch('http://localhost:3001/api/auth/otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@kirana.in' })
  });
  console.log('Email OTP Request:', await resEmail.json());

  // Test Verify with Email
  const resVerify = await fetch('http://localhost:3001/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@kirana.in', otp: '123456' })
  });
  const data = await resVerify.json();
  console.log('Email Verify Result: ok =', data.ok, 'user =', data.user?.name);
}

testAuth();

