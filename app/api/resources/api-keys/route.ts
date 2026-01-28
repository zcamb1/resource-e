import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, apiKey } = await request.json();

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert API key with user_id
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .insert([{ 
        api_key: apiKey, 
        user_id: userId,
        is_active: true 
      }])
      .select()
      .single();

    if (keyError) {
      console.error('Error inserting API key:', keyError);
      return NextResponse.json(
        { error: 'Failed to add API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: keyData.id }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/resources/api-keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


