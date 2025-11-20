import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextRequest } from 'next/server';

export const protocol =
  process.env.NEXT_PUBLIC_PROTOCOL || 'http';
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract subdomain from request headers
 */
export function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development
  if (hostname.includes('.localhost')) {
    return hostname.split('.')[0];
  }

  // Production - extract subdomain from hostname
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}
