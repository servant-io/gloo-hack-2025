/**
 * Utility functions for client-side personalization
 */

/**
 * Get the profile ID from the cookie set by middleware
 */
export function getProfileIdFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'profile_id' && value) {
      return value;
    }
  }

  return null;
}

/**
 * Get the current window URL
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.href;
}
