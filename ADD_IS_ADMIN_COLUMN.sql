-- Thêm column is_admin vào bảng users

-- 1. Thêm column is_admin (default FALSE)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Set admin user hiện tại thành TRUE
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'admin@test.local';

-- 3. Verify
SELECT id, username, email, is_admin, created_at 
FROM users 
ORDER BY is_admin DESC, created_at DESC;

