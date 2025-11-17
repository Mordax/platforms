import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  user: process.env.POSTGRES_USER || 'multitenant_user',
  password: process.env.POSTGRES_PASSWORD || 'multitenant_password',
  database: process.env.POSTGRES_DB || 'multitenant_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on initialization
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = pool;
