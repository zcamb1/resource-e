-- ==============================================
-- SIMPLIFIED SCHEMA - No junction table needed
-- Run this SQL in Supabase SQL Editor
-- ==============================================

-- Add user_id column to api_keys table
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to proxies table  
ALTER TABLE proxies
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to rotating_proxy_keys table
ALTER TABLE rotating_proxy_keys
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create indices for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_proxies_user_id ON proxies(user_id);
CREATE INDEX IF NOT EXISTS idx_rotating_keys_user_id ON rotating_proxy_keys(user_id);

-- Link existing API keys to user zxczczxc
UPDATE api_keys 
SET user_id = '8f400922-1873-4b8a-b4f2-512070c75a3d'
WHERE user_id IS NULL;

SELECT 
  '✅ Schema updated successfully!' as message,
  (SELECT COUNT(*) FROM api_keys WHERE user_id IS NOT NULL) as linked_api_keys,
  (SELECT COUNT(*) FROM proxies WHERE user_id IS NOT NULL) as linked_proxies,
  (SELECT COUNT(*) FROM rotating_proxy_keys WHERE user_id IS NOT NULL) as linked_rotating_keys;

