import { db } from '@/lib/postgres';

export type Collection = {
  id: number;
  subdomain_name: string;
  name: string;
  created_at: string;
};

export type CollectionWithCount = Collection & {
  documentCount: number;
};

/**
 * Validate collection name
 * Same rules as subdomain: lowercase, alphanumeric, hyphens only
 */
export function isValidCollectionName(name: string): boolean {
  if (!name || name.length < 1 || name.length > 63) {
    return false;
  }

  // Must be lowercase alphanumeric with hyphens
  const validPattern = /^[a-z0-9-]+$/;
  return validPattern.test(name);
}

/**
 * Get a specific collection
 */
export async function getCollection(
  subdomain: string,
  collectionName: string
): Promise<Collection | null> {
  try {
    const result = await db.query<Collection>(
      'SELECT * FROM collections WHERE subdomain_name = $1 AND name = $2',
      [subdomain, collectionName]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

/**
 * Get all collections with document counts for a subdomain
 */
export async function getCollectionsWithCounts(
  subdomain: string
): Promise<CollectionWithCount[]> {
  try {
    const result = await db.query<CollectionWithCount>(
      `SELECT
        c.*,
        COUNT(d.id)::int as "documentCount"
      FROM collections c
      LEFT JOIN documents d ON c.subdomain_name = d.subdomain_name AND c.name = d.collection_name
      WHERE c.subdomain_name = $1
      GROUP BY c.id, c.subdomain_name, c.name, c.created_at
      ORDER BY c.created_at ASC`,
      [subdomain]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching collections with counts:', error);
    return [];
  }
}

/**
 * Create a new collection
 * Returns the created collection or null if it already exists
 */
export async function createCollection(
  subdomain: string,
  collectionName: string
): Promise<Collection | null> {
  if (!isValidCollectionName(collectionName)) {
    throw new Error(
      'Invalid collection name. Must be lowercase alphanumeric with hyphens only (1-63 characters).'
    );
  }

  try {
    const result = await db.query<Collection>(
      'INSERT INTO collections (subdomain_name, name) VALUES ($1, $2) ON CONFLICT (subdomain_name, name) DO NOTHING RETURNING *',
      [subdomain, collectionName]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}

/**
 * Get collection counts for all subdomains
 */
export async function getAllCollectionCounts(): Promise<Record<string, number>> {
  try {
    const result = await db.query<{ subdomain_name: string; count: string }>(
      'SELECT subdomain_name, COUNT(*) as count FROM collections GROUP BY subdomain_name'
    );

    const counts: Record<string, number> = {};
    result.rows.forEach(row => {
      counts[row.subdomain_name] = parseInt(row.count);
    });

    return counts;
  } catch (error) {
    console.error('Error getting all collection counts:', error);
    return {};
  }
}
