import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

export interface Publisher {
  id: string;
  name: string;
  email: string;
  organization: string;
}

export interface AuthResult {
  success: boolean;
  user?: Publisher;
  error?: string;
}

/**
 * Server-side function to get current user from auth token
 */
export async function getCurrentUser(): Promise<Publisher | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return null;
    }

    // Decode token (in a real app, verify JWT)
    const decoded = Buffer.from(authToken, 'base64').toString();
    const [userId] = decoded.split(':');

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return null;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    void password; // Explicitly ignore password to avoid ESLint error
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Server-side function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Server-side function to require authentication (redirects if not authenticated)
 */
export async function requireAuth(): Promise<Publisher> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Server-side function to login user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create auth token
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

    const { password: userPassword, ...userWithoutPassword } = user;
    void userPassword; // Explicitly ignore password to avoid ESLint error
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Server-side function to logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}
