const { createClient } = require('@supabase/supabase-js');

// Hardcode values for now
const supabase = createClient(
  'https://hniirgxqqzltezdmzuyj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWlyZ3hxcXpsdGV6ZG16dXlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MTAyMSwiZXhwIjoyMDgzMjU3MDIxfQ.wH0_ypBSFd6Gy5NlKxhMxLFhIo6RG407WCjhCEE-Gk8'
);

async function checkDatabase() {
  console.log('🔍 Checking database...\n');

  // Check all API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`📊 Total API Keys in database: ${apiKeys?.length || 0}`);
  if (apiKeys && apiKeys.length > 0) {
    console.log('   Latest API keys:');
    apiKeys.forEach(k => {
      console.log(`   - ID: ${k.id}, Key: ${k.api_key?.substring(0, 20)}...`);
    });
  }

  // Check all proxies
  const { data: proxies } = await supabase
    .from('proxies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`\n📊 Total Proxies in database: ${proxies?.length || 0}`);
  if (proxies && proxies.length > 0) {
    console.log('   Latest proxies:');
    proxies.forEach(p => {
      console.log(`   - ID: ${p.id}, URL: ${p.proxy_url?.substring(0, 30)}...`);
    });
  }

  // Check all rotating keys
  const { data: rotatingKeys } = await supabase
    .from('rotating_proxy_keys')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`\n📊 Total Rotating Keys in database: ${rotatingKeys?.length || 0}`);
  if (rotatingKeys && rotatingKeys.length > 0) {
    console.log('   Latest rotating keys:');
    rotatingKeys.forEach(k => {
      console.log(`   - ID: ${k.id}, Key: ${k.key_value?.substring(0, 20)}...`);
    });
  }

  // Check user_resources links
  const { data: userResources } = await supabase
    .from('user_resources')
    .select('*');

  console.log(`\n🔗 Total user_resources links: ${userResources?.length || 0}`);
  if (userResources && userResources.length > 0) {
    console.log('   Links:');
    userResources.forEach(r => {
      console.log(`   - User: ${r.user_id?.substring(0, 8)}..., API Key: ${r.api_key_id || 'null'}, Proxy: ${r.proxy_id || 'null'}, Rotating: ${r.rotating_proxy_key_id || 'null'}`);
    });
  } else {
    console.log('   ❌ NO LINKS FOUND! This is the problem!');
  }

  // Check users
  const { data: users } = await supabase
    .from('users')
    .select('id, username');

  console.log(`\n👥 Total users: ${users?.length || 0}`);
  if (users) {
    users.forEach(u => {
      console.log(`   - ${u.username} (ID: ${u.id})`);
    });
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY:');
  console.log(`   API Keys: ${apiKeys?.length || 0}`);
  console.log(`   Proxies: ${proxies?.length || 0}`);
  console.log(`   Rotating Keys: ${rotatingKeys?.length || 0}`);
  console.log(`   User Links: ${userResources?.length || 0}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if ((apiKeys?.length || 0) > 0 && (userResources?.length || 0) === 0) {
    console.log('⚠️  PROBLEM DETECTED: Resources exist but no user links!');
    console.log('   This means the bulk insert failed to create user_resources links.\n');
  }
}

checkDatabase().catch(console.error);

