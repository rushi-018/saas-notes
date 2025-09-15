#!/usr/bin/env node

/**
 * Quick Test Script for SaaS Notes Application
 * Run this to verify basic functionality is working
 */

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Health check passed:', health.status);
    } else {
      console.log('❌ Health check failed');
      return;
    }
    
    // Test login
    console.log('🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acme.test',
        password: 'password'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login test passed');
      
      // Test notes with token
      console.log('📝 Testing notes endpoint...');
      const notesResponse = await fetch('http://localhost:3000/api/notes', {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        console.log(`✅ Notes endpoint passed - Found ${notesData.notes.length} notes`);
      } else {
        console.log('❌ Notes endpoint failed');
      }
    } else {
      console.log('❌ Login test failed');
    }
    
    console.log('\n🎉 API tests completed successfully!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure the dev server is running at http://localhost:3000');
  }
}

testAPI();