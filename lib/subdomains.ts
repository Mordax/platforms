import { db } from '@/lib/postgres';

export function isValidIcon(str: string) {
  if (str.length > 10) {
    return false;
  }

  try {
    // Primary validation: Check if the string contains at least one emoji character
    // This regex pattern matches most emoji Unicode ranges
    const emojiPattern = /[\p{Emoji}]/u;
    if (emojiPattern.test(str)) {
      return true;
    }
  } catch (error) {
    // If the regex fails (e.g., in environments that don't support Unicode property escapes),
    // fall back to a simpler validation
    console.warn(
      'Emoji regex validation failed, using fallback validation',
      error
    );
  }

  // Fallback validation: Check if the string is within a reasonable length
  // This is less secure but better than no validation
  return str.length >= 1 && str.length <= 10;
}

type SubdomainData = {
  emoji: string;
  createdAt: number;
};

export async function getSubdomainData(subdomain: string) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  try {
    const result = await db.query<{ emoji: string; created_at: string }>(
      'SELECT emoji, created_at FROM subdomains WHERE name = $1',
      [sanitizedSubdomain]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      emoji: result.rows[0].emoji,
      createdAt: parseInt(result.rows[0].created_at)
    };
  } catch (error) {
    console.error('Error fetching subdomain data:', error);
    return null;
  }
}

export async function getAllSubdomains() {
  try {
    const result = await db.query<{ name: string; emoji: string; created_at: string }>(
      'SELECT name, emoji, created_at FROM subdomains ORDER BY created_at DESC'
    );

    return result.rows.map((row) => ({
      subdomain: row.name,
      emoji: row.emoji || '❓',
      createdAt: parseInt(row.created_at) || Date.now()
    }));
  } catch (error) {
    console.error('Error fetching all subdomains:', error);
    return [];
  }
}
