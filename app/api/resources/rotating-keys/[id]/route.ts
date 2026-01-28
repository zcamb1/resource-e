import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the rotating key directly (no junction table needed)
    const { error } = await supabase
      .from('rotating_proxy_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rotating key:', error);
      return NextResponse.json(
        { error: 'Failed to delete rotating key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/resources/rotating-keys/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


