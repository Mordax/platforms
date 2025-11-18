# Next.js Multi-Tenant Example

A production-ready example of a multi-tenant application built with Next.js 15, featuring custom subdomains for each tenant.

## Features

- ✅ Custom subdomain routing with Next.js middleware
- ✅ Tenant-specific content and pages
- ✅ Shared components and layouts across tenants
- ✅ PostgreSQL for tenant data storage
- ✅ Admin interface for managing tenants
- ✅ Emoji support for tenant branding
- ✅ Support for local development with subdomains
- ✅ Compatible with Vercel preview deployments

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/) for data storage
- [Tailwind 4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for the design system

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- Docker and Docker Compose (for running PostgreSQL locally)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vercel/platforms.git
   cd platforms
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the PostgreSQL database:

   ```bash
   docker-compose up -d
   ```

   This will start a PostgreSQL instance on port 5433 (to avoid conflicts with other local PostgreSQL instances).

4. Set up environment variables:
   Create a `.env.local` file in the root directory with:

   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5433
   POSTGRES_USER=multitenant_user
   POSTGRES_PASSWORD=multitenant_password
   POSTGRES_DB=multitenant_db
   ```

   (These values match the docker-compose.yml defaults)

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Access the application:
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Tenants: http://[tenant-name].localhost:3000

## Multi-Tenant Architecture

This application demonstrates a subdomain-based multi-tenant architecture where:

- Each tenant gets their own subdomain (`tenant.yourdomain.com`)
- The middleware handles routing requests to the correct tenant
- Tenant data is stored in PostgreSQL in a `subdomains` table
- The main domain hosts the landing page and admin interface
- Subdomains are dynamically mapped to tenant-specific content

The middleware (`middleware.ts`) intelligently detects subdomains across various environments (local development, production, and Vercel preview deployments).

## Deployment

This application is designed to be deployed on Vercel. To deploy:

1. Push your repository to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

For custom domains, make sure to:

1. Add your root domain to Vercel
2. Set up a wildcard DNS record (`*.yourdomain.com`) on Vercel

---
## How to use the new API endpoint creation
🚀 How to Use

1. Create an API Endpoint

# Visit http://localhost:3000
# Enter "howdy" as the endpoint name
# Click "Create API Endpoint"

2. Use the REST API

Via UI:
- Visit http://howdy.localhost:3000
- Use the interactive interface to Create/Read/Update/Delete documents
- create the collections you need, tabs are created for each collection (like users for example)
- note: there is an id and a _meta object containing created and updated information for each created json document.

Via cURL/Postman:
# Create a document
curl -X POST http://127.0.0.1:3000/api/users \
-H "Host: howdy.localhost:3000" \
-H "Content-Type: application/json" \
-d '{"name": "John Doe", "email": "john@example.com"}'

# List all documents
curl http://127.0.0.1:3000/api/users \
-H "Host: howdy.localhost:3000"

# Get specific document
curl http://127.0.0.1:3000/api/users/1 \
-H "Host: howdy.localhost:3000"

# Update document
curl -X PUT http://127.0.0.1:3000/api/users/1 \
-H "Host: howdy.localhost:3000" \
-H "Content-Type: application/json" \
-d '{"name": "Jane Doe", "email": "jane@example.com"}'

# Delete document
curl -X DELETE http://127.0.0.1:3000/api/users/1 \
-H "Host: howdy.localhost:3000"

  ---
📋 API Endpoints Reference

| Method | Endpoint             | Description                                          |
  |--------|----------------------|------------------------------------------------------|
| GET    | /api/{subdomain}     | List all documents (pagination: ?limit=100&offset=0) |
| POST   | /api/{subdomain}     | Create new document                                  |
| GET    | /api/{subdomain}/:id | Get single document                                  |
| PUT    | /api/{subdomain}/:id | Update document                                      |
| DELETE | /api/{subdomain}/:id | Delete document                                      |

  ---
✨ Features

- ✅ JSON Validation - Ensures only valid JSON objects are stored
- ✅ Pagination - Default limit of 100 documents per request
- ✅ JSONB Storage - Efficient PostgreSQL JSONB column with GIN indexing
- ✅ Auto Timestamps - created_at and updated_at automatically managed
- ✅ Cascade Deletes - Deleting an endpoint removes all its documents
- ✅ Interactive UI - Test CRUD operations directly in the browser
- ✅ Document Counts - Admin dashboard shows document count per endpoint
- ✅ Error Handling - Proper HTTP status codes and error messages

  ---
🔍 Testing It Out

1. Start the dev server:
   pnpm dev
2. Create a "howdy" subdomain project endpoint:
   - Go to http://localhost:3000
   - Enter "howdy" and create
3. Try the UI:
   - Visit http://howdy.localhost:3000
   - Create some test collections and documents using the form
4. Check the admin:
   - Visit http://localhost:3000/admin
   - See your endpoint with document count
