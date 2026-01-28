-- Fix Admin User
-- Chạy script này trong Supabase SQL Editor để xóa user cũ và tạo lại

-- 1. Xóa tất cả user admin cũ
DELETE FROM user_resources WHERE user_id IN (
  SELECT id FROM users WHERE username = 'admin' OR email LIKE '%admin%'
);

DELETE FROM users WHERE username = 'admin' OR email LIKE '%admin%'

;

-- 2. Tạo admin user mới với password: admin123
-- Password hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldbNjmkl3pJlYr6iVfS
INSERT INTO users (username, email, password_hash)
VALUES (
  'admin',
  'admin@test.local',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldbNjmkl3pJlYr6iVfS'
);

-- 3. Verify
SELECT id, username, email, created_at FROM users WHERE username = 'admin';

