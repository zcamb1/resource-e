const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('');
console.log('Run this SQL in Supabase:');
console.log('');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@test.local';`);

