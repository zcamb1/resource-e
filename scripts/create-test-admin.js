#!/usr/bin/env node

/**
 * Create Test Admin User
 * 
 * Tạo admin user test cho localhost
 * Credentials:
 *   Email: admin@test.local
 *   Password: admin123
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function createTestAdmin() {
  console.log('🚀 Creating test admin user...\n');

  // Load from .env.local or config.txt
  let supabaseUrl, supabaseKey;

  // Try .env.local first
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
    supabaseUrl = urlMatch ? urlMatch[1].trim() : null;
    supabaseKey = keyMatch ? keyMatch[1].trim() : null;
  }

  // Try config.txt if .env.local not found
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
    console.error('   Please create .env.local or config.txt file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test admin credentials
  const testAdmin = {
    username: 'admin',
    email: 'admin@test.local',
    password: 'admin123',
  };

  try {
    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', testAdmin.email)
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log('━'.repeat(40));
      console.log(`   Email:    ${testAdmin.email}`);
      console.log(`   Password: ${testAdmin.password}`);
      console.log('━'.repeat(40));
      console.log('');
      console.log('🌐 Login at: http://localhost:3000/login');
      return;
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(testAdmin.password, 10);

    // Create admin user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username: testAdmin.username,
          email: testAdmin.email,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    }

    console.log('✅ Test admin user created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('━'.repeat(40));
    console.log(`   Email:    ${testAdmin.email}`);
    console.log(`   Password: ${testAdmin.password}`);
    console.log('━'.repeat(40));
    console.log('');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('');
    console.log('⚠️  NOTE: This is for testing only!');
    console.log('   For production, use environment variables.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestAdmin();

