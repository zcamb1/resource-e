const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hniirgxqqzltezdmzuyj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaWlyZ3hxcXpsdGV6ZG16dXlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY4MTAyMSwiZXhwIjoyMDgzMjU3MDIxfQ.wH0_ypBSFd6Gy5NlKxhMxLFhIo6RG407WCjhCEE-Gk8'
);

async function checkSchema() {
  console.log('🔍 Checking rotating_proxy_keys schema...\n');
  
  // Try to fetch one record to see columns
  const { data, error } = await supabase
    .from('rotating_proxy_keys')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error);
  } else if (data && data.length > 0) {
    console.log('✅ Columns found:', Object.keys(data[0]));
    console.log('\nSample record:', data[0]);
  } else {
    console.log('⚠️ Table is empty, trying to get schema...');
    
    // Try insert with wrong column to see error
    const { error: insertError } = await supabase
      .from('rotating_proxy_keys')
      .insert([{ test: 'test' }]);
    
    console.log('Insert error:', insertError);
  }
}

checkSchema().catch(console.error);

