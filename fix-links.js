const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hniirgxqqzltezdmzuyj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWlyZ3hxcXpsdGV6ZG16dXlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MTAyMSwiZXhwIjoyMDgzMjU3MDIxfQ.wH0_ypBSFd6Gy5NlKxhMxLFhIo6RG407WCjhCEE-Gk8'
);

async function fixLinks() {
  console.log('🔧 Linking all orphaned API keys to user zxczczxc...\n');
  
  const userId = '8f400922-1873-4b8a-b4f2-512070c75a3d'; // zxczczxc

  // Get all API keys
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id');

  console.log(`Found ${apiKeys?.length || 0} API keys`);

  if (apiKeys && apiKeys.length > 0) {
    // Create user_resources links
    const links = apiKeys.map(key => ({
      user_id: userId,
      api_key_id: key.id,
      proxy_id: null,
      rotating_proxy_key_id: null,
    }));

    const { data, error } = await supabase
      .from('user_resources')
      .insert(links)
      .select();

    if (error) {
      console.error('❌ Error creating links:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Successfully linked ${data?.length || 0} API keys!`);
    }
  }
}

fixLinks().catch(console.error);

