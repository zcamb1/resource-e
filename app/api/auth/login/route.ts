import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validateApiKey } from '@/middleware/apiKeyAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schema (accept email or username)
const loginSchema = z.object({
  email: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1),
});

// POST /api/auth/login
export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API key' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    console.log('📥 Login request body:', body);

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { email, username, password } = validation.data;

    // Find user by email or username
    let query = supabase
      .from('users')
      .select('id, username, email, password_hash');

    if (email) {
      query = query.eq('email', email);
    } else if (username) {
      query = query.eq('username', username);
    } else {
      return NextResponse.json(
        { success: false, error: 'Email or username is required' },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await query.single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Token valid for 30 days
    );

    return NextResponse.json({
      success: true,
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


