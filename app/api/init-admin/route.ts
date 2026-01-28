import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Initialize Admin User from Environment Variables
 * 
 * Endpoint này chỉ chạy 1 lần để tạo admin user ban đầu
 * Credentials lấy từ Vercel Environment Variables
 * 
 * Cần set trong Vercel:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 * - ADMIN_USERNAME
 * - INIT_SECRET (để bảo vệ endpoint này)
 */
export async function POST(request: Request) {
  try {
    // 1. Kiểm tra INIT_SECRET để bảo vệ endpoint
    const { secret } = await request.json();
    const expectedSecret = process.env.INIT_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'INIT_SECRET not configured in environment' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 403 }
      );
    }

    // 2. Lấy admin credentials từ environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL or ADMIN_PASSWORD not configured' },
        { status: 500 }
      );
    }

    // 3. Kiểm tra xem admin đã tồn tại chưa
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'Admin user already exists',
          email: existingUser.email,
        },
        { status: 200 }
      );
    }

    // 4. Hash password
    const passwordHash = bcrypt.hashSync(adminPassword, 10);

    // 5. Tạo admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: adminUsername,
          email: adminEmail,
          password_hash: passwordHash,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create admin user', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/init-admin:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get admin initialization status
 */
export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      return NextResponse.json(
        { initialized: false, reason: 'ADMIN_EMAIL not configured' },
        { status: 200 }
      );
    }

    // Check if admin exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', adminEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          initialized: true,
          admin: {
            email: existingUser.email,
            username: existingUser.username,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { initialized: false, reason: 'Admin user not created yet' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/init-admin:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


