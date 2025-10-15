# Basic Example

This is a basic example of using Viron Effect with a simple API.

## Structure

- `api.ts` - API definition with endpoints
- `handlers.ts` - Handler implementations for the API endpoints
- `viron.ts` - Viron configuration and page definitions
- `index.ts` - Server entry point

## Running

```bash
pnpm tsx packages/server/examples/basic/index.ts
```

The server will start on port 3350. You can access:
- API endpoints at http://localhost:3350
- Viron dashboard at https://viron.plus or https://local.viron.work:8000

## Features

This example demonstrates:
- Basic API endpoint definition
- User management endpoints (get user, list users)
- Metrics endpoint (active user count)
- Viron dashboard with table and number components
- CORS configuration for Viron access
