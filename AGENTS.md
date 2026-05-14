# AGENTS.md - Olla UI Monorepo

> Guidelines for AI coding agents working in this repository.

## Project Overview

This is a **Web3 monorepo** for the Olla liquid staking protocol on Aztec. Contains:

- **Frontend** (`services/frontend/`): React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4
- **Backend** (`services/backend/`): Go indexer and API service (skeleton only for now)
- **Shared Types** (`packages/types/`): Generated TypeScript types from Go OpenAPI

## Monorepo Structure

```
olla-ui/
├── services/
│   ├── frontend/          # React frontend
│   └── backend/           # Go indexer (skeleton)
├── packages/
│   └── types/             # Shared TypeScript types
├── k8s/
│   └── infra/             # Shared K8s infrastructure
└── docker-compose.yml     # Dev environment
```

## Tech Stack & Versions

### Frontend

| Technology | Version | Notes |
|------------|---------|-------|
| React | 19.2.0 | With react-dom 19.2.0 |
| TypeScript | 5.9.3 | Strict mode enabled |
| Vite | 7.2.4 | Build tool with HMR |
| Tailwind CSS | 4.1.18 | v4 with `@tailwindcss/vite` plugin |
| Zod | 4.3.6 | Schema validation & type inference |
| wagmi | 3.3.4 | React hooks for Ethereum |
| viem | 2.44.4 | TypeScript Ethereum library |
| RainbowKit | 2.2.10 | Wallet connection UI |
| TanStack Query | 5.90.19 | Server state management |
| ESLint | 9.39.1 | Flat config format |
| Prettier | 3.8.1 | Code formatter |

### Indexer

| Technology | Version | Notes |
|------------|---------|-------|
| Go | 1.22 | Backend language |
| Gin | 1.9.1 | HTTP router |
| pgx | 5.5.5 | PostgreSQL driver |
| Tern | 2.1.1 | Database migrations |
| Zap | 1.27.0 | Structured logging |
| go-ethereum | 1.13.14 | Ethereum client |

### Tooling

| Technology | Version | Notes |
|------------|---------|-------|
| Node.js | 18+ | Required runtime |
| Yarn | 4.12.0 | Package manager (Berry) |
| Docker | - | Dev environment |
| Kubernetes | - | Deployment |

## Root Commands

```bash
# Development (starts postgres + frontend)
make dev              # Start dev environment

# Build
yarn build            # Build all packages

# Linting
yarn lint             # Run ESLint on all files

# Indexer
make migrate-up       # Run database migrations (from services/backend)
make migrate-down     # Rollback migrations (from services/backend)
make swagger          # Generate OpenAPI docs (from services/backend)
```

## Frontend Commands

```bash
# From root
cd services/frontend

# Development
yarn dev              # Start dev server (Vite)

# Build
yarn build            # TypeScript check + production build

# Linting
yarn lint             # Run ESLint on all files

# Formatting
yarn pretty           # Format code with Prettier

# Preview
yarn preview          # Preview production build locally
```

## Indexer Commands

```bash
# From root
# cd services/backend

# Development
make run              # Run the Go server locally

# Build
make build            # Build binary to bin/server

# Database
make migrate-up       # Run migrations
make migrate-down     # Rollback migrations (from services/backend)
make migrate-create   # Create new migration

# Swagger
make swagger          # Generate OpenAPI docs (from services/backend)

# Tests
make test             # Run Go tests
```

## Project Structure

### Frontend (`services/frontend/`)

```
services/frontend/
├── src/
│   ├── components/      # Global shared UI
│   │   ├── ui/          # Generic "Atoms"
│   │   └── layout/      # Structural templates
│   ├── features/        # Vertical slices
│   ├── hooks/           # Shared protocol hooks
│   ├── providers/       # Global providers
│   ├── routes/          # TanStack Router
│   └── lib/             # Utilities
├── k8s/                 # Frontend K8s manifests
├── package.json
└── ... (config files)
```

### Indexer (`services/backend/`)

```
services/backend/
├── cmd/
│   └── main.go          # Application entry point
├── internal/
│   ├── config/          # Configuration management
│   ├── database/        # Database connection
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # Gin middleware
│   ├── models/          # Data models
│   └── indexer/         # ETH event listener
├── migrations/          # Tern migration files
├── docs/                # Swagger docs (generated)
├── k8s/                 # Backend K8s manifests
├── Dockerfile
├── Makefile
└── go.mod
```

### Shared Types (`packages/types/`)

```
packages/types/
├── src/
│   └── generated/       # Generated from OpenAPI
│       └── schema.ts
└── package.json
```

## Type Generation Workflow

Types are generated from backend OpenAPI spec:

1. Backend defines handlers with swagger annotations
2. Run `make swagger` in `services/backend/` to generate `docs/swagger.yaml`
3. Run `yarn types:generate` in root to generate TypeScript types
4. Frontend imports types from `@olla-ui/types`

Example:

```typescript
import { components } from "@olla-ui/types/src/generated/schema";

type Stake = components["schemas"]["Stake"];
```

## Frontend Code Style Guidelines

### TypeScript

- **Strict mode** is enabled - no implicit `any`, unused variables, or parameters
- Use `verbatimModuleSyntax` - explicit `type` imports required for type-only imports
- Use `interface` for component props, `type` for unions/utilities

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
```

### Components

- Use **function declarations** (not arrow functions) for components
- Use **named exports** for components (except App which uses default)

```typescript
// Correct
export function MyComponent({ prop }: MyComponentProps) {
  return <div>{prop}</div>;
}
```

### Hooks

- Custom hooks go in `services/frontend/src/hooks/` with `use` prefix
- Return structured objects with data and actions

```typescript
export function useMyHook() {
  return {
    data: formattedData,
    action: { write: doAction, isPending, isConfirmed },
  };
}
```

### Imports

Order imports as follows:

1. CSS imports
2. React imports
3. External libraries
4. Local imports

```typescript
import "@rainbow-me/rainbowkit/styles.css";

import { useState } from "react";
import { useAccount } from "wagmi";

import { Header } from "./components/Header";
import { CONTRACTS } from "./constants/contracts";
```

### Web3 Patterns

- Use `useConnection` for wallet address and connection status
- Use `useReadContract` for reading blockchain state
- Use `useWriteContract` for transactions
- Addresses are typed as `` `0x${string}` ``

## Environment Variables

### Frontend (`services/frontend/.env`)

```
VITE_RPC_URL_FOUNDRY=http://localhost:8545
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### Indexer (`services/backend/.env`)

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB_NAME=olla_indexer
POSTGRES_USER=olla
POSTGRES_PASSWORD=password
POSTGRES_SSL_ENABLED=disable

RPC_URL=http://localhost:8545
PORT=8080
LOG_LEVEL=info
```

## Development Workflow

1. Start PostgreSQL: `docker-compose up -d`
2. Run frontend: `yarn dev` (from root)
3. Run backend: `# cd services/backend && make run`
4. Generate types after backend changes: `yarn types:generate`

## Related Repositories

- **olla-core**: Smart contracts (<https://github.com/ollafinance/core>)
- ABIs are generated from olla-core and placed in `services/frontend/src/abis/`

## Common Pitfalls

1. **Don't commit ABIs** - `src/abis/` is gitignored (generated files)
2. **Use Yarn 4** - Run `yarn` not `npm install`
3. **Install deps from root** - Yarn workspaces handle dependencies
4. **Don't commit Go modules** - Only commit `go.mod` and `go.sum`, not `vendor/`
5. **Run migrations** - Database changes require `make migrate-up`
