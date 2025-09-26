import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { upsertProfile } from './lib/personalization/actions';
import type { UpsertProfileParams } from './lib/personalization/profile';

const PROFILE_COOKIE_NAME = 'profile_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  try {
    // Get existing profile ID from cookie
    const existingProfileId = request.cookies.get(PROFILE_COOKIE_NAME)?.value;

    if (existingProfileId) {
      // Profile exists - early return and just refresh the cookie expiration
      response.cookies.set(PROFILE_COOKIE_NAME, existingProfileId, {
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });

      // Add profile ID to headers for server components
      response.headers.set('x-profile-id', existingProfileId);
    } else {
      // No existing profile, create a new one
      const profileData: UpsertProfileParams = {
        clientIp: await getClientIp(request),
      };

      const result = await upsertProfile(profileData);

      if (result && Array.isArray(result) && result[0]?.id) {
        // Set cookie with the new profile ID
        response.cookies.set(PROFILE_COOKIE_NAME, result[0].id, {
          maxAge: COOKIE_MAX_AGE,
          path: '/',
          sameSite: 'lax',
        });

        // Add profile ID to headers for server components
        response.headers.set('x-profile-id', result[0].id);
      }
    }
  } catch (error) {
    console.error('Error in personalization middleware:', error);
    // Don't throw error - continue with request even if personalization fails
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
};

/**
 * Utility function to get client IP address from request
 */
async function getClientIp(request: NextRequest): Promise<string> {
  // Try to get IP from headers (common in production environments)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const clientIp = request.headers.get('x-client-ip');
  const fastlyClientIp = request.headers.get('fastly-client-ip');
  const trueClientIp = request.headers.get('true-client-ip');

  // Function to check if IP is localhost
  const isLocalhostIp = (ip: string): boolean => {
    return ip === '::1' || ip === '127.0.0.1' || ip === 'localhost';
  };

  // Check x-forwarded-for first (most common proxy header)
  if (forwardedFor) {
    // x-forwarded-for may contain multiple IPs, first one is the client
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    const clientIp = ips[0];

    // If it's localhost and we're in development, try to get external IP
    if (isLocalhostIp(clientIp) && process.env.NODE_ENV === 'development') {
      try {
        const publicIp = await fetchPublicIp();
        return publicIp;
      } catch (error) {
        console.warn('Failed to fetch public IP for development:', error);
        // Fall back to the localhost IP if external fetch fails
        return clientIp;
      }
    }

    return clientIp;
  }

  // Check other common headers
  const headerIps = [
    realIp,
    cfConnectingIp,
    clientIp,
    fastlyClientIp,
    trueClientIp,
  ];
  for (const ip of headerIps) {
    if (ip) {
      // If it's localhost and we're in development, try to get external IP
      if (isLocalhostIp(ip) && process.env.NODE_ENV === 'development') {
        try {
          const publicIp = await fetchPublicIp();
          return publicIp;
        } catch (error) {
          console.warn('Failed to fetch public IP for development:', error);
          // Fall back to the localhost IP if external fetch fails
          return ip;
        }
      }
      return ip;
    }
  }

  // In development mode, try to fetch public IP from external service
  if (process.env.NODE_ENV === 'development') {
    try {
      const publicIp = await fetchPublicIp();
      return publicIp;
    } catch (error) {
      console.warn('Failed to fetch public IP for development:', error);
    }
  }

  // Fallback when no IP can be determined
  return 'unknown';
}

/**
 * Fetch public IP address from external service for development
 */
async function fetchPublicIp(): Promise<string> {
  try {
    const response = await fetch('https://ipv6.icanhazip.com/', {
      headers: {
        'User-Agent': 'Next.js Middleware',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const ip = await response.text();
    return ip.trim();
  } catch {
    // Fallback to IPv4 service if IPv6 fails
    try {
      const response = await fetch('https://ipv4.icanhazip.com/', {
        headers: {
          'User-Agent': 'Next.js Middleware',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ip = await response.text();
      return ip.trim();
    } catch (fallbackError) {
      throw new Error(`Failed to fetch public IP: ${fallbackError}`);
    }
  }
}
