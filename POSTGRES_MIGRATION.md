# PostgreSQL Migration Guide

This document outlines the changes made to replace Redis with PostgreSQL for local development.

## What Changed

### Files Created
1. **docker-compose.yml** - PostgreSQL Docker container configuration (port 5433)
2. **init.sql** - Database schema initialization script
3. **lib/postgres.ts** - PostgreSQL connection pool client
4. **.env.local** - Environment variables for PostgreSQL connection
5. **.env.example** - Template for environment variables

### Files Modified
1. **lib/subdomains.ts** - Replaced Redis queries with PostgreSQL queries
2. **app/actions.ts** - Updated create/delete operations to use PostgreSQL
3. **README.md** - Updated documentation to reflect PostgreSQL setup
4. **package.json** - Added `pg` and `@types/pg` dependencies

### Files Not Modified (Still Work)
- **middleware.ts** - No changes needed (routing logic unchanged)
- **All UI components** - No changes needed
- **All other app routes** - No changes needed

## Database Schema

The PostgreSQL database uses a simple table structure:

```sql
CREATE TABLE subdomains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_subdomains_name` - Fast lookups by subdomain name
- `idx_subdomains_created_at` - Efficient sorting by creation date

## How to Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 Alpine container
- Expose it on port **5433** (non-standard port to avoid conflicts)
- Automatically run `init.sql` to create the schema
- Create a persistent volume for data storage

### 2. Verify Database is Running

```bash
docker ps | grep multitenant_postgres
```

### 3. Check Database Health

```bash
docker logs multitenant_postgres
```

You should see messages indicating the database is ready to accept connections.

### 4. Connect to Database (Optional)

If you want to inspect the database directly:

```bash
docker exec -it multitenant_postgres psql -U multitenant_user -d multitenant_db
```

Then run SQL commands like:
```sql
-- View all subdomains
SELECT * FROM subdomains;

-- Count total subdomains
SELECT COUNT(*) FROM subdomains;
```

Type `\q` to exit.

### 5. Start the Next.js Application

```bash
pnpm dev
```

The application will connect to PostgreSQL on port 5433.

## Environment Variables

The following environment variables are configured in `.env.local`:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=multitenant_user
POSTGRES_PASSWORD=multitenant_password
POSTGRES_DB=multitenant_db
```

You can modify these if needed, but make sure to update `docker-compose.yml` accordingly.

## Testing the Migration

1. **Create a subdomain:**
   - Go to http://localhost:3000
   - Enter a subdomain name and select an emoji
   - Click "Create Subdomain"
   - You should be redirected to `http://subdomain.localhost:3000`

2. **View admin dashboard:**
   - Go to http://localhost:3000/admin
   - You should see all created subdomains

3. **Delete a subdomain:**
   - In the admin dashboard, click the trash icon on any subdomain
   - It should be removed from the list

## Stopping the Database

To stop the PostgreSQL container:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Troubleshooting

### Port 5433 is already in use

If you get a port conflict error:

1. Edit `docker-compose.yml` and change the port mapping:
   ```yaml
   ports:
     - "5434:5432"  # Change 5433 to another port
   ```

2. Update `.env.local` with the new port:
   ```
   POSTGRES_PORT=5434
   ```

### Connection refused errors

Make sure the PostgreSQL container is running:
```bash
docker ps
```

Check the container logs:
```bash
docker logs multitenant_postgres
```

### Database schema not created

If the `subdomains` table doesn't exist, you can manually run the initialization:

```bash
docker exec -i multitenant_postgres psql -U multitenant_user -d multitenant_db < init.sql
```

## Production Considerations

This setup uses Docker for local development. For production deployment:

1. Use a managed PostgreSQL service (e.g., Vercel Postgres, Supabase, AWS RDS)
2. Update the environment variables with production credentials
3. Ensure proper connection pooling limits
4. Add database migrations tooling (e.g., Prisma, Drizzle, or raw SQL scripts)
5. Implement proper error handling and retries
6. Set up database backups and monitoring

---
## To directly access the postgres via command line in docker:
docker exec -it multitenant_postgres psql -U multitenant_user -d multitenant_db

Explanation:
- -U multitenant_user → Username
- -d multitenant_db → Database name (not password!)

When you exec into the container, you don't need to provide the password because you're already
inside the container's environment.

  ---
Useful PostgreSQL Commands Once You're In:

-- List all tables
\dt

-- Describe subdomains table structure
\d subdomains

-- Describe documents table structure
\d documents

-- View all subdomains
SELECT * FROM subdomains;

-- View all documents
SELECT * FROM documents;

-- View documents with pretty JSON formatting
SELECT id, subdomain_name, jsonb_pretty(data) as data, created_at
FROM documents;

-- Count documents per subdomain
SELECT subdomain_name, COUNT(*) as count
FROM documents
GROUP BY subdomain_name;

-- Exit psql
\q

