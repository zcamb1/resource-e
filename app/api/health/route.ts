import { NextResponse } from 'next/server';

// GET /api/health
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ElevenLabs Resource Manager',
    version: '1.0.0',
  });
}


