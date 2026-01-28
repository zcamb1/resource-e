import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, proxyUrl } = await request.json();

    if (!userId || !proxyUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert proxy with user_id
    const { data: proxyData, error: proxyError } = await supabase
      .from('proxies')
      .insert([{ 
        proxy_url: proxyUrl,
        user_id: userId,
        is_active: true 
      }])
      .select()
      .single();

    if (proxyError) {
      console.error('Error inserting proxy:', proxyError);
      return NextResponse.json(
        { error: 'Failed to add proxy' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: proxyData.id }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/resources/proxies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


