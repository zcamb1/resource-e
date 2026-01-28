import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!';

// Encrypt response để tránh bị sniff
function encryptResponse(data: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'response-salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Return iv:encrypted
  return iv.toString('base64') + ':' + encrypted;
}

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

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/resources/by-username/[username]
// Public endpoint - KHÔNG cần JWT token, chỉ cần username
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    console.log(`[API] Fetching resources for username: ${params.username}`);
    
    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', params.username)
      .single();

    if (userError || !user) {
      console.error(`[API] User not found: ${params.username}`);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user.id;
    console.log(`[API] Found user_id: ${userId}`);

    // Fetch ElevenLabs Accounts
    const { data: elevenLabsAccounts } = await supabase
      .from('elevenlabs_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Decrypt passwords
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

    console.log(`[API] Returning ${accountsWithPassword.length} accounts`);

    const response = {
      elevenlabs_accounts: accountsWithPassword,
    };

    // TODO: Enable encryption sau khi test
    // const encrypted = encryptResponse(JSON.stringify(response));
    // return NextResponse.json({ encrypted: encrypted }, { status: 200 });

    // Tạm thời trả về plaintext để test
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/resources/by-username:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
