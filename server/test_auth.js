/**
 * Test script for Firebase Auth + JWT implementation
 * Run this to verify the authentication system is working
 */

const baseUrl = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing Firebase Auth + JWT Implementation\n');

  // Test 1: Register a new user
  console.log('1️⃣  Testing user registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
      }),
    });

    const registerData = await registerResponse.json();
    
    if (registerData.success && registerData.token) {
      console.log('✅ Registration successful - JWT token received');
      console.log(`   Token: ${registerData.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Registration failed:', registerData.message);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }

  // Test 2: Login with existing user
  console.log('\n2️⃣  Testing login...');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success && loginData.token) {
      console.log('✅ Login successful - JWT token received');
      const token = loginData.token;
      
      // Test 3: Access protected endpoint with token
      console.log('\n3️⃣  Testing protected endpoint (with token)...');
      const spendingResponse = await fetch(`${baseUrl}/api/spending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const spendingData = await spendingResponse.json();
      
      if (spendingResponse.ok) {
        console.log('✅ Protected endpoint accessible with valid token');
        console.log(`   Found ${spendingData.count} spending entries`);
      } else {
        console.log('❌ Protected endpoint failed:', spendingData.message);
      }

      // Test 4: Access user info
      console.log('\n4️⃣  Testing /api/users/me endpoint...');
      const meResponse = await fetch(`${baseUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const meData = await meResponse.json();
      
      if (meResponse.ok) {
        console.log('✅ User info retrieved successfully');
        console.log(`   Email: ${meData.data.email}`);
        console.log(`   Name: ${meData.data.firstName} ${meData.data.lastName}`);
      } else {
        console.log('❌ User info failed:', meData.message);
      }
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }

  // Test 5: Access protected endpoint without token
  console.log('\n5️⃣  Testing protected endpoint (without token)...');
  try {
    const unauthorizedResponse = await fetch(`${baseUrl}/api/spending`);
    const unauthorizedData = await unauthorizedResponse.json();
    
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Protected endpoint correctly blocked without token');
      console.log(`   Message: ${unauthorizedData.message}`);
    } else {
      console.log('❌ Protected endpoint should have returned 401');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 6: Test global endpoint (public)
  console.log('\n6️⃣  Testing public endpoint (no auth required)...');
  try {
    const cardsResponse = await fetch(`${baseUrl}/api/cards`);
    const cardsData = await cardsResponse.json();
    
    if (cardsResponse.ok) {
      console.log('✅ Public endpoint accessible without token');
      console.log(`   Found ${cardsData.count} cards`);
    } else {
      console.log('❌ Public endpoint failed:', cardsData.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n✨ Authentication tests complete!\n');
}

// Run tests
testAuth().catch(console.error);
