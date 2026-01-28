-- ============================================
-- FIX DUPLICATE API KEYS & UPDATE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add user_id columns if not exists
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE proxies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE rotating_proxy_keys
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Delete duplicate API keys (keep only the latest one for each api_key value)
DELETE FROM api_keys
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY api_key ORDER BY created_at DESC) as rn
    FROM api_keys
  ) t
  WHERE rn > 1
);

-- Step 3: Now safely update user_id for remaining unique keys
UPDATE api_keys 
SET user_id = '8f400922-1873-4b8a-b4f2-512070c75a3d'
WHERE user_id IS NULL;

-- Step 4: Create indices for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_rotating_keys_user_id ON rotating_proxy_keys(user_id);

-- Step 5: Show results
SELECT 
  '✅ Fixed successfully!' as status,
  (SELECT COUNT(*) FROM api_keys WHERE user_id IS NOT NULL) as linked_api_keys,
  (SELECT COUNT(*) FROM proxies WHERE user_id IS NOT NULL) as linked_proxies,
  (SELECT COUNT(*) FROM rotating_proxy_keys WHERE user_id IS NOT NULL) as linked_rotating_keys;

