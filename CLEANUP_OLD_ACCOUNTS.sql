-- Cleanup Script: Xóa accounts cũ khỏi api_keys table
-- Chạy script này trên Supabase SQL Editor

-- 1. Xem các records cần xóa (accounts có format email|password hoặc email:password)
SELECT id, api_key, created_at 
FROM api_keys 
WHERE api_key LIKE '%@%' 
  AND (api_key LIKE '%|%' OR api_key LIKE '%:%')
ORDER BY created_at DESC;

-- 2. XÓA các accounts cũ này (KHÔNG THỂ HOÀN TÁC!)
-- Uncomment dòng dưới để chạy:
-- DELETE FROM api_keys 
-- WHERE api_key LIKE '%@%' 
--   AND (api_key LIKE '%|%' OR api_key LIKE '%:%');

-- 3. Verify đã xóa xong
SELECT COUNT(*) as remaining_fake_keys 
FROM api_keys 
WHERE api_key LIKE '%@%';
