-- DEBUG: Kiểm tra user_id mismatch

-- 1. Xem tất cả users trong hệ thống
SELECT id, username, email, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Xem elevenlabs_accounts và user_id của chúng
SELECT 
  ea.id,
  ea.email,
  ea.user_id,
  u.username as owner_username,
  ea.created_at
FROM elevenlabs_accounts ea
LEFT JOIN users u ON u.id = ea.user_id
ORDER BY ea.created_at DESC;

-- 3. Nếu user_id NULL hoặc sai, FIX nó:
-- Thay 'YOUR_CORRECT_USER_ID' bằng user_id thật của bạn từ query 1
/*
UPDATE elevenlabs_accounts 
SET user_id = 'YOUR_CORRECT_USER_ID'
WHERE user_id IS NULL OR user_id != 'YOUR_CORRECT_USER_ID';
*/
