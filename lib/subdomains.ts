import { db } from '@/lib/postgres';

type SubdomainData = {
  name: string;
  createdAt: number;
};

export async function getSubdomainData(subdomain: string) {
  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  try {
    const result = await db.query<{ name: string; created_at: string }>(
      'SELECT name, created_at FROM subdomains WHERE name = $1',
      [sanitizedSubdomain]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      name: result.rows[0].name,
      createdAt: parseInt(result.rows[0].created_at)
    };
  } catch (error) {
    console.error('Error fetching subdomain data:', error);
    return null;
  }
}

export async function getAllSubdomains() {
  try {
    const result = await db.query<{ name: string; created_at: string }>(
      'SELECT name, created_at FROM subdomains ORDER BY created_at DESC'
    );

    return result.rows.map((row) => ({
      subdomain: row.name,
      createdAt: parseInt(row.created_at) || Date.now()
    }));
  } catch (error) {
    console.error('Error fetching all subdomains:', error);
    return [];
  }
}
