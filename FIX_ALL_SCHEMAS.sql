-- ============================================
-- FIX ALL TABLE SCHEMAS FOR SIMPLIFIED USAGE
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add proxy_url column to proxies table (for bulk import)
ALTER TABLE proxies 
ADD COLUMN IF NOT EXISTS proxy_url TEXT;

-- Make old proxy columns optional (not everyone fills them out)
ALTER TABLE proxies 
ALTER COLUMN proxy_type DROP NOT NULL,
ALTER COLUMN host DROP NOT NULL,
ALTER COLUMN port DROP NOT NULL;

-- 2. Proxies table is now complete
-- User can paste full proxy URL like: http://user:pass@host:port

-- 3. rotating_proxy_keys is already correct with api_key and key_name

-- 4. Show current state
SELECT 
  '✅ All schemas fixed!' as status,
  (SELECT COUNT(*) FROM api_keys) as api_keys_count,
  (SELECT COUNT(*) FROM proxies) as proxies_count,
  (SELECT COUNT(*) FROM rotating_proxy_keys) as rotating_keys_count;

