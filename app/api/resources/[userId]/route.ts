import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateApiKey } from '@/middleware/apiKeyAuth';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!';

// Decrypt password when fetching
function decryptPassword(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
}

// Disable caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/resources/[userId]
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API key' },
      { status: 401 }
    );
  }
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', params.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's API Keys directly
    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('id, api_key, is_active, created_at')
      .eq('user_id', params.userId);

    // Fetch user's Proxies directly
    const { data: proxies } = await supabase
      .from('proxies')
      .select('id, proxy_url, is_active, created_at')
      .eq('user_id', params.userId);

    // Fetch user's Rotating Keys directly
    const { data: rotatingKeys } = await supabase
      .from('rotating_proxy_keys')
      .select('id, api_key, key_name, is_active, created_at')
      .eq('user_id', params.userId);

    // Fetch user's ElevenLabs Accounts directly
    const { data: elevenLabsAccounts } = await supabase
      .from('elevenlabs_accounts')
      .select('*')
      .eq('user_id', params.userId)
      .eq('is_active', true);

    // Decrypt passwords for elevenlabs accounts
    const accountsWithPassword = (elevenLabsAccounts || []).map((acc: any) => ({
      id: acc.id,
      email: acc.email,
      password: decryptPassword(acc.password_encrypted),
      credits: acc.credits || 0,
      character_limit: acc.character_limit || 0,
      tier: acc.tier || 'free',
      status: acc.status || '',
      is_active: acc.is_active,
      last_checked_at: acc.last_checked_at,
      created_at: acc.created_at,
    }));

    // Format response for dashboard
    const response = {
      api_keys: apiKeys || [],
      proxies: proxies || [],
      rotating_proxy_keys: rotatingKeys || [],
      elevenlabs_accounts: accountsWithPassword,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/resources/[userId]:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


