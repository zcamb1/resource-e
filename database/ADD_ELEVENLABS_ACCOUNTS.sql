-- Add ElevenLabs Accounts table for centralized account management
-- Run this SQL in Supabase SQL Editor

-- 1. Create elevenlabs_accounts table
CREATE TABLE IF NOT EXISTS elevenlabs_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,  -- Encrypted with server secret
    is_active BOOLEAN DEFAULT true,
    credits INTEGER DEFAULT 0,
    character_limit INTEGER DEFAULT 0,
    tier VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50),
    last_checked_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- 2. Create index for performance
CREATE INDEX idx_elevenlabs_accounts_user_id ON elevenlabs_accounts(user_id);
CREATE INDEX idx_elevenlabs_accounts_active ON elevenlabs_accounts(is_active);
CREATE INDEX idx_elevenlabs_accounts_email ON elevenlabs_accounts(email);

-- 3. Add updated_at trigger
CREATE TRIGGER update_elevenlabs_accounts_updated_at BEFORE UPDATE ON elevenlabs_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security
ALTER TABLE elevenlabs_accounts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy - Users can only see their own accounts
CREATE POLICY "Users can view own elevenlabs accounts" ON elevenlabs_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own elevenlabs accounts" ON elevenlabs_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own elevenlabs accounts" ON elevenlabs_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own elevenlabs accounts" ON elevenlabs_accounts
    FOR DELETE USING (auth.uid() = user_id);

COMMIT;
