import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE all resources of a specific type for a user
export async function POST(request: Request) {
  try {
    const { userId, type } = await request.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (type === 'api_keys') {
      // Delete API keys directly by user_id
      const { data, error } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', userId)
        .select();

      if (!error && data) {
        deletedCount = data.length;
      }
    } else if (type === 'proxies') {
      // Delete proxies directly by user_id
      const { data, error } = await supabase
        .from('proxies')
        .delete()
        .eq('user_id', userId)
        .select();

      if (!error && data) {
        deletedCount = data.length;
      }
    } else if (type === 'rotating_keys') {
      // Delete rotating keys directly by user_id
      const { data, error } = await supabase
        .from('rotating_proxy_keys')
        .delete()
        .eq('user_id', userId)
        .select();

      if (!error && data) {
        deletedCount = data.length;
      }
    } else if (type === 'elevenlabs_accounts') {
      // Delete ElevenLabs accounts directly by user_id
      const { data, error } = await supabase
        .from('elevenlabs_accounts')
        .delete()
        .eq('user_id', userId)
        .select();

      if (!error && data) {
        deletedCount = data.length;
      }
    }

    return NextResponse.json({
      success: true,
      count: deletedCount,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/resources/bulk-delete:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

