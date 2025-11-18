import { NextRequest, NextResponse } from 'next/server';
import { getSubdomainData } from '@/lib/subdomains';
import { getCollection } from '@/lib/collections';
import {
  getDocument,
  updateDocument,
  deleteDocument,
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
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

/**
 * GET /api/[collection]/[id]
 * Get a single document by ID
 * Accessed via: subdomain.localhost:3000/api/collection-name/123
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const subdomain = extractSubdomain(request);
    const documentId = parseInt(id);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Could not determine subdomain from request' },
        { status: 400 }
      );
    }

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
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

    // Get document
    const document = await getDocument(subdomain, collection, documentId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Return clean response with data at top level
    return NextResponse.json({
      id: document.id,
      ...document.data,
      _meta: {
        created_at: document.created_at,
        updated_at: document.updated_at
      }
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/[collection]/[id]
 * Update a document by ID
 * Accessed via: subdomain.localhost:3000/api/collection-name/123
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const subdomain = extractSubdomain(request);
    const documentId = parseInt(id);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Could not determine subdomain from request' },
        { status: 400 }
      );
    }

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
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

    // Update document
    const document = await updateDocument(subdomain, collection, documentId, body);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Return clean response with data at top level
    return NextResponse.json({
      id: document.id,
      ...document.data,
      _meta: {
        created_at: document.created_at,
        updated_at: document.updated_at
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);

    if (error.message?.includes('Invalid JSON')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/[collection]/[id]
 * Delete a document by ID
 * Accessed via: subdomain.localhost:3000/api/collection-name/123
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const subdomain = extractSubdomain(request);
    const documentId = parseInt(id);

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Could not determine subdomain from request' },
        { status: 400 }
      );
    }

    if (isNaN(documentId)) {
      return NextResponse.json(
        { error: 'Invalid document ID' },
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

    // Delete document
    const success = await deleteDocument(subdomain, collection, documentId);

    if (!success) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
