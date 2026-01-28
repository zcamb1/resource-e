#!/usr/bin/env node

/**
 * Hash Password Generator
 * 
 * Usage:
 *   node scripts/hash-password.js yourpassword
 *   node scripts/hash-password.js
 */

const bcrypt = require('bcrypt');

// Get password from command line or prompt
const password = process.argv[2];

if (!password) {
  console.log('❌ Vui lòng nhập password!');
  console.log('');
  console.log('Sử dụng:');
  console.log('  node scripts/hash-password.js yourpassword');
  console.log('');
  console.log('Ví dụ:');
  console.log('  node scripts/hash-password.js admin123');
  process.exit(1);
}

// Hash password with bcrypt (10 rounds)
const hash = bcrypt.hashSync(password, 10);

console.log('');
console.log('✅ Password đã được hash!');
console.log('');
console.log('📋 Copy hash này vào SQL:');
console.log('━'.repeat(60));
console.log(hash);
console.log('━'.repeat(60));
console.log('');
console.log('📝 SQL Query:');
console.log('');
console.log(`INSERT INTO users (username, email, password_hash)`);
console.log(`VALUES (`);
console.log(`  'your_username',`);
console.log(`  'your_email@example.com',`);
console.log(`  '${hash}'`);
console.log(`);`);
console.log('');


