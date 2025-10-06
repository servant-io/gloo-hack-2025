import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock users data (in a real app, this would be from a database)
const mockUsers = [
  {
    id: '1',
    email: 'publisher@crossway.com',
    password: 'demo123',
    name: 'Sarah Johnson',
    organization: 'Crossway Publishers',
  },
  {
    id: '2',
    email: 'admin@westminster.edu',
    password: 'demo123',
    name: 'Michael Chen',
    organization: 'Westminster Seminary',
  },
  {
    id: '3',
    email: 'content@baker.com',
    password: 'demo123',
    name: 'Rebecca Martinez',
    organization: 'Baker Academic',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create auth token (in a real app, use JWT or similar)
    const authToken = Buffer.from(`${user.id}:${Date.now()}`).toString(
      'base64'
    );

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
