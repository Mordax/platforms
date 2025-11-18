-- Create subdomains table
CREATE TABLE IF NOT EXISTS subdomains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_subdomains_name ON subdomains(name);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_subdomains_created_at ON subdomains(created_at DESC);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    subdomain_name VARCHAR(255) NOT NULL,
    name VARCHAR(63) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_collection_per_subdomain UNIQUE (subdomain_name, name),
    CONSTRAINT fk_collection_subdomain
        FOREIGN KEY (subdomain_name)
        REFERENCES subdomains(name)
        ON DELETE CASCADE
);

-- Create indexes for collections table
CREATE INDEX IF NOT EXISTS idx_collections_subdomain ON collections(subdomain_name);
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections(name);

-- Create documents table for storing JSON data
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    subdomain_name VARCHAR(255) NOT NULL,
    collection_name VARCHAR(63) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_subdomain
        FOREIGN KEY (subdomain_name)
        REFERENCES subdomains(name)
        ON DELETE CASCADE,
    CONSTRAINT fk_document_collection
        FOREIGN KEY (subdomain_name, collection_name)
        REFERENCES collections(subdomain_name, name)
        ON DELETE CASCADE
);

-- Create indexes for documents table
CREATE INDEX IF NOT EXISTS idx_documents_subdomain ON documents(subdomain_name);
CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection_name);
CREATE INDEX IF NOT EXISTS idx_documents_subdomain_collection ON documents(subdomain_name, collection_name);
CREATE INDEX IF NOT EXISTS idx_documents_data ON documents USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Create trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for documents table
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
