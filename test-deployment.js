/**
 * Test Deployment Script
 * Chạy script này để kiểm tra deployment có hoạt động không
 * 
 * Usage:
 *   node test-deployment.js https://your-app.vercel.app
 */

const https = require('https');

const SERVER_URL = process.argv[2];

if (!SERVER_URL) {
  console.error('❌ Vui lòng cung cấp URL!');
  console.error('Usage: node test-deployment.js https://your-app.vercel.app');
  process.exit(1);
}

console.log('🧪 Testing deployment...\n');
console.log(`Server: ${SERVER_URL}\n`);

// Test 1: Health check
function testHealth() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing /api/health...');
    
    const url = `${SERVER_URL}/api/health`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Health check OK');
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Body: ${data}\n`);
          resolve(true);
        } else {
          console.log(`   ❌ Health check failed: ${res.statusCode}`);
          console.log(`   Body: ${data}\n`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 2: Login (với credentials sai để test endpoint)
function testLogin() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing /api/auth/login...');
    
    const url = new URL(`${SERVER_URL}/api/auth/login`);
    const postData = JSON.stringify({
      username: 'test',
      password: 'test'
    });
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 401 = endpoint hoạt động (credentials sai như mong đợi)
        if (res.statusCode === 401 || res.statusCode === 400) {
          console.log('   ✅ Login endpoint OK (responded with auth error as expected)');
          console.log(`   Status: ${res.statusCode}\n`);
          resolve(true);
        } else {
          console.log(`   ⚠️ Unexpected status: ${res.statusCode}`);
          console.log(`   Body: ${data}\n`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 3: Check homepage
function testHomepage() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing homepage /...');
    
    https.get(SERVER_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Homepage accessible');
        console.log(`   Status: ${res.statusCode}\n`);
        resolve(true);
      } else {
        console.log(`   ❌ Homepage error: ${res.statusCode}\n`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(await testHealth());
  results.push(await testLogin());
  results.push(await testHomepage());
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 TEST RESULTS\n');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log('✅ ALL TESTS PASSED!');
    console.log(`✅ ${passed}/${total} tests successful\n`);
    console.log('🎉 Your deployment is working correctly!');
    console.log('📤 You can now send this URL to update the tool.\n');
  } else {
    console.log(`⚠️ ${passed}/${total} tests passed`);
    console.log('❌ Some tests failed. Please check:');
    console.log('   1. Environment variables are set correctly');
    console.log('   2. Database migrations have been run');
    console.log('   3. Deployment completed successfully\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runTests();
