/**
 * API Key Authentication Middleware
 * Require X-API-Key header for all API requests
 */

import { NextRequest, NextResponse } from 'next/server';

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_SECRET_KEY;

  if (!validApiKey) {
    console.error('⚠️ API_SECRET_KEY not configured in environment variables!');
    return false;
  }

  return apiKey === validApiKey;
}

export function apiKeyMiddleware(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    // Skip API key check for health endpoint
    if (request.url.includes('/api/health')) {
      return handler(request, context);
    }

    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized: Invalid or missing API key',
          hint: 'Add X-API-Key header with valid API key'
        },
        { status: 401 }
      );
    }

    // API key valid, proceed
    return handler(request, context);
  };
}





