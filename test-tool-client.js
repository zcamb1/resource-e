/**
 * Test script để mô phỏng tool lấy resources từ server
 * Run: node test-tool-client.js
 */

const https = require('http');

// Config
const SERVER_URL = 'http://localhost:3001';
const USERNAME = 'xzzz';  // Thay bằng username của bạn  
const PASSWORD = 'password_cua_ban';   // Thay bằng password thật của user xzzz

async function apiRequest(method, path, data = null, token = null) {
  const url = new URL(path, SERVER_URL);
  
  const options = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function login(username, password) {
  console.log(`🔐 Đang login với user: ${username}...`);
  
  const response = await apiRequest('POST', '/api/auth/login', {
    username,
    password
  });
  
  if (response.status === 200) {
    const { token, userId } = response.data;
    console.log(`✅ Login thành công!`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...${token.slice(-10)}\n`);
    return { token, userId };
  } else {
    console.log(`❌ Login thất bại: ${response.status}`);
    console.log(`   Response:`, response.data);
    return null;
  }
}

async function getResources(userId, token) {
  console.log(`📦 Đang lấy resources cho user ID: ${userId}...`);
  
  const response = await apiRequest('GET', `/api/resources/${userId}`, null, token);
  
  if (response.status === 200) {
    const data = response.data;
    const apiKeys = data.api_keys || [];
    const proxies = data.proxies || [];
    const rotatingKeys = data.rotating_proxy_keys || [];
    
    console.log(`✅ Lấy resources thành công!\n`);
    
    // Display API Keys
    console.log(`🔑 API Keys: ${apiKeys.length} keys`);
    apiKeys.slice(0, 3).forEach((key, i) => {
      const apiKey = key.api_key || '';
      console.log(`   ${i + 1}. ${apiKey.substring(0, 10)}...${apiKey.slice(-10)}`);
    });
    if (apiKeys.length > 3) {
      console.log(`   ... và ${apiKeys.length - 3} keys nữa`);
    }
    
    // Display Proxies
    console.log(`\n🌐 Proxies: ${proxies.length} proxies`);
    proxies.slice(0, 3).forEach((proxy, i) => {
      const proxyUrl = proxy.proxy_url || 'N/A';
      console.log(`   ${i + 1}. ${proxyUrl.substring(0, 50)}`);
    });
    if (proxies.length > 3) {
      console.log(`   ... và ${proxies.length - 3} proxies nữa`);
    }
    
    // Display Rotating Keys
    console.log(`\n🔄 Rotating Proxy Keys: ${rotatingKeys.length} keys`);
    rotatingKeys.slice(0, 3).forEach((key, i) => {
      const apiKey = key.api_key || '';
      console.log(`   ${i + 1}. ${apiKey.substring(0, 10)}...${apiKey.slice(-10)}`);
    });
    if (rotatingKeys.length > 3) {
      console.log(`   ... và ${rotatingKeys.length - 3} keys nữa`);
    }
    
    // Save to file
    const fs = require('fs');
    const outputFile = `resources_${USERNAME}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log(`\n💾 Đã lưu vào file: ${outputFile}`);
    
    return data;
  } else {
    console.log(`❌ Lỗi lấy resources: ${response.status}`);
    console.log(`   Response:`, response.data);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 TEST TOOL CLIENT - FETCH RESOURCES FROM SERVER');
  console.log('='.repeat(60));
  console.log();
  
  try {
    // Step 1: Login
    const auth = await login(USERNAME, PASSWORD);
    
    if (!auth) {
      console.log('\n❌ Không thể tiếp tục test do login thất bại');
      return;
    }
    
    console.log('-'.repeat(60));
    
    // Step 2: Get Resources
    const resources = await getResources(auth.userId, auth.token);
    
    if (resources) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ TEST THÀNH CÔNG!');
      console.log('='.repeat(60));
      console.log('\n📝 Workflow cho tool thật:');
      console.log('   1. User nhập username/password trong tool');
      console.log('   2. Tool gọi /api/auth/login → lấy token + userId');
      console.log('   3. Tool gọi /api/resources/{userId} → lấy tất cả resources');
      console.log('   4. Tool load API keys, proxies, rotating keys vào memory');
      console.log('   5. Tool sẵn sàng xử lý batch!');
    } else {
      console.log('\n❌ TEST THẤT BẠI!');
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.log('\n⚠️  Đảm bảo server đang chạy: npm run dev');
  }
}

main();

