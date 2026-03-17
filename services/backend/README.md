# Olla Backend Service

Go backend service for indexing ETH events and serving API endpoints.

## Structure

- `cmd/` - Application entry point
- `internal/` - Internal packages
- `migrations/` - Database migrations (Tern)
- `docs/` - Swagger/OpenAPI documentation
- `k8s/` - Kubernetes manifests

## Commands

```bash
# Run locally
make run

# Build
make build

# Run migrations
make migrate-up

# Generate Swagger docs
make swagger

# Run tests
make test
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection string
- `RPC_URL` - Ethereum RPC endpoint
- `PORT` - HTTP server port (default: 8080)
- `LOG_LEVEL` - Log level (default: info)
