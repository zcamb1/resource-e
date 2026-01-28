-- Fix rotating_proxy_keys table schema
-- Run this in Supabase SQL Editor

-- Option 1: Add key_value column (recommended for simple bulk import)
ALTER TABLE rotating_proxy_keys 
ADD COLUMN IF NOT EXISTS key_value TEXT;

-- Make old columns optional
ALTER TABLE rotating_proxy_keys 
ALTER COLUMN key_name DROP NOT NULL,
ALTER COLUMN api_key DROP NOT NULL;

-- Set default values for old columns
UPDATE rotating_proxy_keys 
SET key_name = 'Imported Key', 
    api_key = key_value 
WHERE key_name IS NULL AND key_value IS NOT NULL;

-- Show result
SELECT 
  '✅ Schema fixed!' as status,
  COUNT(*) as total_rotating_keys
FROM rotating_proxy_keys;

