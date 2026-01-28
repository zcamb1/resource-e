-- ============================================
-- COMPLETE MIGRATION FOR ALL USERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add user_id columns to all resource tables
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

-- Step 3: If user_resources table exists, migrate data from it
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

    RAISE NOTICE 'Migrated data from user_resources table';
  ELSE
    RAISE NOTICE 'user_resources table does not exist, skipping migration';
  END IF;
END $$;

-- Step 4: For any orphaned resources (no user_id), assign to a default user
-- You can change this user_id to your actual admin/default user
DO $$
DECLARE
  default_user_id UUID;
BEGIN
  -- Get the first user (or change this to your preferred default user)
  SELECT id INTO default_user_id FROM users WHERE username = 'zxczczxc' LIMIT 1;
  
  IF default_user_id IS NOT NULL THEN
    UPDATE api_keys SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE proxies SET user_id = default_user_id WHERE user_id IS NULL;
    UPDATE rotating_proxy_keys SET user_id = default_user_id WHERE user_id IS NULL;
    
    RAISE NOTICE 'Assigned orphaned resources to user: %', default_user_id;
  END IF;
END $$;

-- Step 5: Create indices for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_rotating_keys_user_id ON rotating_proxy_keys(user_id);

-- Step 6: Drop user_resources table if it exists (no longer needed)
DROP TABLE IF EXISTS user_resources;

-- Step 7: Show final statistics
SELECT 
  '✅ Migration completed successfully!' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM api_keys) as total_api_keys,
  (SELECT COUNT(*) FROM api_keys WHERE user_id IS NOT NULL) as linked_api_keys,
  (SELECT COUNT(*) FROM proxies) as total_proxies,
  (SELECT COUNT(*) FROM proxies WHERE user_id IS NOT NULL) as linked_proxies,
  (SELECT COUNT(*) FROM rotating_proxy_keys) as total_rotating_keys,
  (SELECT COUNT(*) FROM rotating_proxy_keys WHERE user_id IS NOT NULL) as linked_rotating_keys;

