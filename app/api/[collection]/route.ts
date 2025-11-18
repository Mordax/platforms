import { NextRequest, NextResponse } from 'next/server';
import { getSubdomainData } from '@/lib/subdomains';
import { createCollection, getCollection, isValidCollectionName } from '@/lib/collections';
import {
  getDocuments,
  createDocument,
  isValidJSON
} from '@/lib/documents';

/**
 * Extract subdomain from request headers
 */
function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development
  if (hostname.includes('.localhost')) {
    return hostname.split('.')[0];
  }

  // Production - extract subdomain from hostname
  // This assumes the subdomain is the first part before the root domain
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

/**
 * GET /api/[collection]
 * List all documents for a collection with pagination
 * Accessed via: subdomain.localhost:3000/api/collection-name
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const subdomain = extractSubdomain(request);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Could not determine subdomain from request' },
        { status: 400 }
      );
    }

    // Verify subdomain exists
    const subdomainData = await getSubdomainData(subdomain);
    if (!subdomainData) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Verify collection exists
    const collectionData = await getCollection(subdomain, collection);
    if (!collectionData) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate pagination parameters
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    const result = await getDocuments(subdomain, collection, limit, offset);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[collection]
 * Create a new document for a collection (auto-creates collection if needed)
 * Accessed via: subdomain.localhost:3000/api/collection-name
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const subdomain = extractSubdomain(request);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Could not determine subdomain from request' },
        { status: 400 }
      );
    }

    // Verify subdomain exists
    const subdomainData = await getSubdomainData(subdomain);
    if (!subdomainData) {
      return NextResponse.json(
        { error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    // Validate collection name
    if (!isValidCollectionName(collection)) {
      return NextResponse.json(
        { error: 'Invalid collection name. Must be lowercase alphanumeric with hyphens only (1-63 characters).' },
        { status: 400 }
      );
    }

    // Auto-create collection if it doesn't exist
    let collectionData = await getCollection(subdomain, collection);
    if (!collectionData) {
      collectionData = await createCollection(subdomain, collection);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate JSON structure
    if (!isValidJSON(body)) {
      return NextResponse.json(
        { error: 'Request body must be a valid JSON object' },
        { status: 400 }
      );
    }

    // Create document
    const document = await createDocument(subdomain, collection, body);

    if (!document) {
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);

    if (error.message?.includes('Invalid')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
