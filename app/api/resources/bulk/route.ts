import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!';

// Encrypt password before storing
function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// POST bulk insert resources
export async function POST(request: Request) {
  try {
    const { userId, type, items } = await request.json();

    if (!userId || !type || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    let insertedCount = 0;

    if (type === 'api_keys') {
      // Bulk insert API keys with user_id
      const apiKeyRecords = items.map(key => ({
        api_key: key,
        user_id: userId,
        is_active: true,
      }));

      const { data: keys, error: keyError } = await supabase
        .from('api_keys')
        .insert(apiKeyRecords)
        .select();

      if (keyError || !keys) {
        console.error('Error inserting API keys:', keyError);
        return NextResponse.json(
          { error: 'Failed to insert API keys', count: 0 },
          { status: 500 }
        );
      }

      insertedCount = keys.length;
    } else if (type === 'proxies') {
      // Bulk insert proxies with user_id
      const proxyRecords = items.map(proxy => ({
        proxy_url: proxy,
        user_id: userId,
        is_active: true,
      }));

      const { data: proxies, error: proxyError } = await supabase
        .from('proxies')
        .insert(proxyRecords)
        .select();

      if (proxyError || !proxies) {
        console.error('Error inserting proxies:', proxyError);
        return NextResponse.json(
          { error: 'Failed to insert proxies', count: 0 },
          { status: 500 }
        );
      }

      insertedCount = proxies.length;
    } else if (type === 'rotating_keys') {
      // Bulk insert rotating keys with user_id
      const keyRecords = items.map(key => ({
        api_key: key,
        key_name: key.substring(0, 20) + '...', // Auto-generate name
        user_id: userId,
        is_active: true,
      }));

      const { data: keys, error: keyError } = await supabase
        .from('rotating_proxy_keys')
        .insert(keyRecords)
        .select();

      if (keyError || !keys) {
        console.error('Error inserting rotating keys:', keyError);
        return NextResponse.json(
          { error: 'Failed to insert rotating keys', count: 0 },
          { status: 500 }
        );
      }

      insertedCount = keys.length;
    } else if (type === 'elevenlabs_accounts') {
      // Bulk insert ElevenLabs accounts with encryption
      const accountRecords = items.map((acc: {email: string, password: string}) => ({
        email: acc.email,
        password_encrypted: encryptPassword(acc.password),
        user_id: userId,
        is_active: true,
      }));

      const { data: accounts, error: accountError } = await supabase
        .from('elevenlabs_accounts')
        .insert(accountRecords)
        .select();

      if (accountError || !accounts) {
        console.error('Error inserting ElevenLabs accounts:', accountError);
        return NextResponse.json(
          { error: 'Failed to insert accounts', details: accountError?.message, count: 0 },
          { status: 500 }
        );
      }

      insertedCount = accounts.length;
    }

    return NextResponse.json({
      success: true,
      count: insertedCount,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/resources/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

