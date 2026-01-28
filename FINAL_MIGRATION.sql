-- ============================================
-- FINAL COMPLETE MIGRATION SCRIPT
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Step 1: Add user_id columns to all resource tables
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE proxies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE rotating_proxy_keys
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Add proxy_url column for simple bulk import
ALTER TABLE proxies 
ADD COLUMN IF NOT EXISTS proxy_url TEXT;

-- Step 3: Make old proxy columns optional
ALTER TABLE proxies 
ALTER COLUMN proxy_type DROP NOT NULL,
ALTER COLUMN host DROP NOT NULL,
ALTER COLUMN port DROP NOT NULL;

-- Step 4: rotating_proxy_keys already has correct schema (api_key, key_name)

-- Step 5: Delete duplicate API keys (keep latest)
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

-- Step 6: Link existing resources to user (if user_resources table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_resources') THEN
    -- Migrate API keys
    UPDATE api_keys
    SET user_id = ur.user_id
    FROM user_resources ur
    WHERE api_keys.id = ur.api_key_id
    AND api_keys.user_id IS NULL;

    -- Migrate proxies
    UPDATE proxies
    SET user_id = ur.user_id
    FROM user_resources ur
    WHERE proxies.id = ur.proxy_id
    AND proxies.user_id IS NULL;

    -- Migrate rotating keys
    UPDATE rotating_proxy_keys
    SET user_id = ur.user_id
    FROM user_resources ur
    WHERE rotating_proxy_keys.id = ur.rotating_proxy_key_id
    AND rotating_proxy_keys.user_id IS NULL;

    -- Drop user_resources table (no longer needed)
    DROP TABLE user_resources;
    
    RAISE NOTICE 'Migrated and dropped user_resources table';
  END IF;
END $$;

-- Step 7: For orphaned resources, assign to default user
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  -- Get default user (change username if needed)
  SELECT id INTO default_user_id FROM users WHERE username = 'zxczczxc' LIMIT 1;
  
  IF default_user_id IS NOT NULL THEN
    UPDATE api_keys SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE proxies SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE rotating_proxy_keys SET user_id = default_user_id WHERE user_id IS NULL;
    
    RAISE NOTICE 'Assigned orphaned resources to user: %', default_user_id;
  END IF;
END $$;

-- Step 8: Create indices for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_rotating_keys_user_id ON rotating_proxy_keys(user_id);

-- Step 9: Show final statistics
SELECT 
  '✅ MIGRATION COMPLETED!' as status,
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM api_keys) as total_api_keys,
  (SELECT COUNT(*) FROM api_keys WHERE user_id IS NOT NULL) as linked_api_keys,
  (SELECT COUNT(*) FROM proxies) as total_proxies,
  (SELECT COUNT(*) FROM proxies WHERE user_id IS NOT NULL) as linked_proxies,
  (SELECT COUNT(*) FROM rotating_proxy_keys) as total_rotating_keys,
  (SELECT COUNT(*) FROM rotating_proxy_keys WHERE user_id IS NOT NULL) as linked_rotating_keys;

-- Done! Now test by:
-- 1. Reload dashboard (F5)
-- 2. Try adding/deleting resources
-- 3. Create new user and add their resources

