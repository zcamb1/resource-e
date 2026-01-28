// Test to see which Supabase URL is being used
console.log('🔍 Checking environment variables...\n');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set');

// Try to load from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
  console.log('\n📂 After loading .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
} catch (err) {
  console.log('\n⚠️ Could not load .env.local');
}

