import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here!!'; // Must be 32 chars

// Encrypt password before storing
function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt password when fetching
function decryptPassword(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Verify JWT token
function verifyToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET - Fetch all accounts for a user
export async function GET(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data, error } = await supabase
      .from('elevenlabs_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // Return accounts with decrypted passwords
    const accounts = data.map((acc: any) => ({
      id: acc.id,
      email: acc.email,
      password: decryptPassword(acc.password_encrypted),
      credits: acc.credits || 0,
      character_limit: acc.character_limit || 0,
      tier: acc.tier || 'free',
      status: acc.status || '',
      is_active: acc.is_active,
      last_checked_at: acc.last_checked_at,
      notes: acc.notes,
      created_at: acc.created_at,
      updated_at: acc.updated_at,
    }));
    
    return NextResponse.json({
      success: true,
      accounts,
      count: accounts.length
    });
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new account
export async function POST(request: NextRequest) {
  try {
    const tokenUserId = verifyToken(request);
    if (!tokenUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { userId, email, password, notes } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Determine target user_id:
    // - If userId provided in body (admin adding for another user), use it
    // - Otherwise use token's userId (user adding for themselves)
    const targetUserId = userId || tokenUserId;
    
    // Encrypt password
    const passwordEncrypted = encryptPassword(password);
    
    // Insert into database
    const { data, error } = await supabase
      .from('elevenlabs_accounts')
      .insert({
        user_id: targetUserId,  // ✅ Use targetUserId instead of tokenUserId
        email: email,
        password_encrypted: passwordEncrypted,
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      
      // Check for duplicate
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Account with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      account: {
        id: data.id,
        email: data.email,
        credits: data.credits,
        created_at: data.created_at,
      },
      message: 'Account added successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update account (for credits, status, etc.)
export async function PUT(request: NextRequest) {
  try {
    const userId = verifyToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, credits, character_limit, tier, status, is_active, notes } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    // Build update object (only include provided fields)
    const updates: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (credits !== undefined) updates.credits = credits;
    if (character_limit !== undefined) updates.character_limit = character_limit;
    if (tier !== undefined) updates.tier = tier;
    if (status !== undefined) updates.status = status;
    if (is_active !== undefined) updates.is_active = is_active;
    if (notes !== undefined) updates.notes = notes;
    
    // Update last_checked_at if credits/status changed
    if (credits !== undefined || status !== undefined) {
      updates.last_checked_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('elevenlabs_accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)  // Ensure user owns this account
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      account: {
        id: data.id,
        email: data.email,
        credits: data.credits,
        tier: data.tier,
        status: data.status,
        is_active: data.is_active,
        updated_at: data.updated_at,
      },
      message: 'Account updated successfully'
    });
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
