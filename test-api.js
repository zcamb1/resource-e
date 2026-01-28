// Test API to check if resources are being fetched correctly

const testUserId = 'zxczczxc'; // Replace with your actual user ID

async function testGetResources() {
  try {
    console.log('🧪 Testing GET /api/resources/' + testUserId);
    
    const response = await fetch(`http://localhost:3000/api/resources/${testUserId}`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.api_keys) {
      console.log(`\n✅ API Keys count: ${data.api_keys.length}`);
    }
    if (data.proxies) {
      console.log(`✅ Proxies count: ${data.proxies.length}`);
    }
    if (data.rotating_proxy_keys) {
      console.log(`✅ Rotating Keys count: ${data.rotating_proxy_keys.length}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Also test direct Supabase query
async function testDirectDB() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('\n🔍 Testing direct database query...');
  
  // Check user_resources
  const { data: userResources, error } = await supabase
    .from('user_resources')
    .select('*')
    .eq('user_id', testUserId);
  
  console.log('user_resources:', userResources);
  console.log('error:', error);
  
  if (userResources && userResources.length > 0) {
    console.log(`\n✅ Found ${userResources.length} resource links for user`);
    
    // Count by type
    const apiKeyCount = userResources.filter(r => r.api_key_id !== null).length;
    const proxyCount = userResources.filter(r => r.proxy_id !== null).length;
    const rotatingCount = userResources.filter(r => r.rotating_proxy_key_id !== null).length;
    
    console.log(`  - API Keys: ${apiKeyCount}`);
    console.log(`  - Proxies: ${proxyCount}`);
    console.log(`  - Rotating Keys: ${rotatingCount}`);
  } else {
    console.log('❌ No resources found for this user');
  }
}

(async () => {
  await testGetResources();
  await testDirectDB();
})();

