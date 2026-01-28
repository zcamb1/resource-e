import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Count resources
    const { data: apiKeys, count: apiCount } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact' });

    const { data: proxies, count: proxyCount } = await supabase
      .from('proxies')
      .select('*', { count: 'exact' });

    const { data: rotatingKeys, count: rotatingCount } = await supabase
      .from('rotating_proxy_keys')
      .select('*', { count: 'exact' });

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      counts: {
        api_keys: apiCount || apiKeys?.length || 0,
        proxies: proxyCount || proxies?.length || 0,
        rotating_keys: rotatingCount || rotatingKeys?.length || 0,
      },
      sample_api_key: apiKeys?.[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  }
}

