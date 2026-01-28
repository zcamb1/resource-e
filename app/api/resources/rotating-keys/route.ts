import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, keyValue } = await request.json();

    if (!userId || !keyValue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert rotating key with user_id
    const { data: keyData, error: keyError } = await supabase
      .from('rotating_proxy_keys')
      .insert([{ 
        api_key: keyValue,
        key_name: keyValue.substring(0, 20) + '...', // Auto-generate name from key
        user_id: userId,
        is_active: true 
      }])
      .select()
      .single();

    if (keyError) {
      console.error('Error inserting rotating key:', keyError);
      return NextResponse.json(
        { error: 'Failed to add rotating key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: keyData.id }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/resources/rotating-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


