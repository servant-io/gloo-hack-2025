'use client';

import { Publisher } from './auth.server';

export interface AuthContextType {
  user: Publisher | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Client-side login function
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: unknown }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    return { success: data.success, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false };
  }
}

/**
 * Client-side logout function
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Client-side function to check if user is authenticated
 * This is a simple check - for production, you'd want to verify the token server-side
 */
export function isAuthenticatedClient(): boolean {
  // Check if auth cookie exists (client-side check)
  // In a production app, you'd want to verify this server-side or use a more secure method
  return document.cookie.includes('auth-token=');
}

/**
 * Fetch current user from the server
 */
export async function getCurrentUser(): Promise<Publisher | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
