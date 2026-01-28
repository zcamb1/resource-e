// Test login API directly
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.local',
        password: 'admin123',
      }),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ LOGIN SUCCESS!');
      console.log('Token:', data.token);
      console.log('User ID:', data.userId);
      console.log('Username:', data.username);
    } else {
      console.log('\n❌ LOGIN FAILED!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();

