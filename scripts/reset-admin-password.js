#!/usr/bin/env node

/**
 * Reset Admin Password
 * 
 * Reset password for admin@test.local
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function resetPassword() {
  console.log('🔐 Resetting admin password...\n');

  // Load credentials
  let supabaseUrl, supabaseKey;

  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
    supabaseKey = keyMatch ? keyMatch[1].trim() : null;
  }

  if (!supabaseUrl || !supabaseKey) {
    const configPath = path.join(__dirname, '..', 'config.txt');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const urlMatch = configContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
      const keyMatch = configContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
      supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
      supabaseKey = keyMatch ? keyMatch[1].trim() : null;
    }
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials!');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const testPassword = 'admin123';
  const testEmail = 'admin@test.local';

  try {
    // Hash new password
    const passwordHash = bcrypt.hashSync(testPassword, 10);

    // Update password
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', testEmail)
      .select();

    if (error) {
      console.error('❌ Error updating password:', error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.error(`❌ User ${testEmail} not found!`);
      console.log('   Creating new user...\n');
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          username: 'admin',
          email: testEmail,
          password_hash: passwordHash,
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        process.exit(1);
      }

      console.log('✅ Admin user created!');
    } else {
      console.log('✅ Password reset successfully!');
    }

    console.log('');
    console.log('📋 Login Credentials:');
    console.log('━'.repeat(40));
    console.log(`   Email:    ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('━'.repeat(40));
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();

