async function testProductionAuth() {
  // 1. Test Merchant Standard Sign In (Email + Password)
  const resLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramesh@kirana.in', password: 'Password123!' })
  });
  const loginData = await resLogin.json();
  console.log('Merchant Sign In with Password:', { ok: loginData.ok, user: loginData.user?.name, role: loginData.user?.role });

  // 2. Test Staff Sign In (Ops Manager)
  const resStaff = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'neha.manager@paytm.com', password: 'Password123!' })
  });
  const staffData = await resStaff.json();
  console.log('Staff Sign In:', { ok: staffData.ok, requires2FA: staffData.requires2FA, role: staffData.role });

  // 3. Test Create Account (Sign Up)
  const testEmail = `newmerchant_${Date.now()}@paytmshop.in`;
  const resSignup = await fetch('http://localhost:3001/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sunil Verma',
      businessName: 'Verma Provisions',
      email: testEmail,
      password: 'MyPassword123!',
      phone: '9812345678',
      category: 'Grocery / Kirana'
    })
  });
  const signupData = await resSignup.json();
  console.log('Merchant Sign Up (Create Account):', { ok: signupData.ok, user: signupData.user?.name, business: signupData.user?.businessName });
}

testProductionAuth();

