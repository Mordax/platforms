-- Migration: Add multi-collection support to subdomains
-- Date: 2025-11-17
-- Description: Transform subdomains into project namespaces with multiple collections

-- Step 1: Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    subdomain_name VARCHAR(255) NOT NULL,
    name VARCHAR(63) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collection_subdomain
        FOREIGN KEY (subdomain_name)
        REFERENCES subdomains(name)
        ON DELETE CASCADE,
    CONSTRAINT unique_collection_per_subdomain
        UNIQUE (subdomain_name, name)
);

-- Step 2: Create indexes for collections table
CREATE INDEX IF NOT EXISTS idx_collections_subdomain ON collections(subdomain_name);
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);

-- Step 3: Add collection_name column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS collection_name VARCHAR(63);

-- Step 4: Migrate existing documents to a default collection
-- Create a default collection for each subdomain that has documents
INSERT INTO collections (subdomain_name, name, created_at)
SELECT DISTINCT subdomain_name, 'default', MIN(created_at)
FROM documents
WHERE subdomain_name IN (SELECT name FROM subdomains)
ON CONFLICT (subdomain_name, name) DO NOTHING;

-- Step 5: Set collection_name for existing documents
UPDATE documents
SET collection_name = 'default'
WHERE collection_name IS NULL;

-- Step 6: Make collection_name NOT NULL after migration
ALTER TABLE documents ALTER COLUMN collection_name SET NOT NULL;

-- Step 7: Drop old foreign key constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_subdomain;

-- Step 8: Add new foreign key constraint to collections table
ALTER TABLE documents ADD CONSTRAINT fk_document_collection
    FOREIGN KEY (subdomain_name, collection_name)
    REFERENCES collections(subdomain_name, name)
    ON DELETE CASCADE;

-- Step 9: Update indexes on documents table
DROP INDEX IF EXISTS idx_documents_subdomain;
CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(subdomain_name, collection_name);
