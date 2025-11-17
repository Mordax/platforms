import { db } from '@/lib/postgres';

export type Document = {
  id: number;
  subdomain_name: string;
  data: any;
  created_at: string;
  updated_at: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

/**
 * Validate JSON data
 * Ensures the data is a valid JSON object
 */
export function isValidJSON(data: any): boolean {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }
  try {
    // Try to stringify and parse to ensure it's valid JSON
    JSON.parse(JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a new document for a subdomain
 */
export async function createDocument(
  subdomain: string,
  data: any
): Promise<Document | null> {
  if (!isValidJSON(data)) {
    throw new Error('Invalid JSON data. Must be a valid JSON object.');
  }

  try {
    const result = await db.query<Document>(
      'INSERT INTO documents (subdomain_name, data) VALUES ($1, $2) RETURNING *',
      [subdomain, JSON.stringify(data)]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      data: result.rows[0].data
    };
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

/**
 * Get all documents for a subdomain with pagination
 */
export async function getDocuments(
  subdomain: string,
  limit: number = 100,
  offset: number = 0
): Promise<PaginatedResult<Document>> {
  try {
    // Get total count
    const countResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM documents WHERE subdomain_name = $1',
      [subdomain]
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    // Get paginated documents
    const result = await db.query<Document>(
      'SELECT * FROM documents WHERE subdomain_name = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [subdomain, limit, offset]
    );

    return {
      data: result.rows.map(row => ({
        ...row,
        data: row.data
      })),
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Get a single document by ID for a specific subdomain
 */
export async function getDocument(
  subdomain: string,
  id: number
): Promise<Document | null> {
  try {
    const result = await db.query<Document>(
      'SELECT * FROM documents WHERE subdomain_name = $1 AND id = $2',
      [subdomain, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      data: result.rows[0].data
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

/**
 * Update a document by ID for a specific subdomain
 */
export async function updateDocument(
  subdomain: string,
  id: number,
  data: any
): Promise<Document | null> {
  if (!isValidJSON(data)) {
    throw new Error('Invalid JSON data. Must be a valid JSON object.');
  }

  try {
    const result = await db.query<Document>(
      'UPDATE documents SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE subdomain_name = $2 AND id = $3 RETURNING *',
      [JSON.stringify(data), subdomain, id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      ...result.rows[0],
      data: result.rows[0].data
    };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

/**
 * Delete a document by ID for a specific subdomain
 */
export async function deleteDocument(
  subdomain: string,
  id: number
): Promise<boolean> {
  try {
    const result = await db.query(
      'DELETE FROM documents WHERE subdomain_name = $1 AND id = $2',
      [subdomain, id]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Delete all documents for a subdomain (used when deleting a subdomain)
 */
export async function deleteAllDocuments(subdomain: string): Promise<number> {
  try {
    const result = await db.query(
      'DELETE FROM documents WHERE subdomain_name = $1',
      [subdomain]
    );

    return result.rowCount ?? 0;
  } catch (error) {
    console.error('Error deleting all documents:', error);
    throw error;
  }
}

/**
 * Get document count for a subdomain
 */
export async function getDocumentCount(subdomain: string): Promise<number> {
  try {
    const result = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM documents WHERE subdomain_name = $1',
      [subdomain]
    );

    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('Error getting document count:', error);
    return 0;
  }
}

/**
 * Get document counts for all subdomains
 */
export async function getAllDocumentCounts(): Promise<Record<string, number>> {
  try {
    const result = await db.query<{ subdomain_name: string; count: string }>(
      'SELECT subdomain_name, COUNT(*) as count FROM documents GROUP BY subdomain_name'
    );

    const counts: Record<string, number> = {};
    result.rows.forEach(row => {
      counts[row.subdomain_name] = parseInt(row.count);
    });

    return counts;
  } catch (error) {
    console.error('Error getting all document counts:', error);
    return {};
  }
}
