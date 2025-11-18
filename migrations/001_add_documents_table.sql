-- Migration: Transform emoji-based tenant system to REST API endpoint system
-- Date: 2025-11-17

-- Step 1: Create documents table for storing JSON data
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    subdomain_name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subdomain
        FOREIGN KEY (subdomain_name)
        REFERENCES subdomains(name)
        ON DELETE CASCADE
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_subdomain ON documents(subdomain_name);
CREATE INDEX IF NOT EXISTS idx_documents_data ON documents USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Step 3: Remove emoji column from subdomains table
ALTER TABLE subdomains DROP COLUMN IF EXISTS emoji;

-- Step 4: Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
