-- Create subdomains table
CREATE TABLE IF NOT EXISTS subdomains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_subdomains_name ON subdomains(name);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_subdomains_created_at ON subdomains(created_at DESC);
