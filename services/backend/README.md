# Olla Indexer

A Go-based indexer service for the Olla liquid staking protocol. Indexes Ethereum events from the OllaVault contract and serves them via a REST API.

## Features

- **Event Indexing**: Monitors OllaVault contract for deposit and withdrawal events
- **REST API**: Query indexed data by address
- **Resumable**: Tracks last processed block, can resume from interruption
- **Configurable**: Polling interval and start block configurable via environment

## Events Indexed

| Event | Description |
|-------|-------------|
| `Deposit` | User stakes assets into the vault |
| `RedeemRequest` | User initiates a pending withdrawal |
| `WithdrawalClaimed` | User claims a pending withdrawal |

## Prerequisites

- Go 1.25+
- PostgreSQL 14+
- Ethereum RPC endpoint

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_HOST` | No | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |
| `POSTGRES_DB_NAME` | No | `olla_indexer_testnet` | Database name |
| `POSTGRES_USER` | No | `admin` | Database user |
| `POSTGRES_PASSWORD` | Yes | - | Database password |
| `POSTGRES_SSL_ENABLED` | No | `disable` | SSL mode (`disable`/`require`) |
| `RPC_URL` | Yes | - | Ethereum RPC endpoint |
| `CONTRACTS_ENV` | No | `local` | Deployment environment (`local`/`sepolia`/`mainnet`) |
| `POLL_INTERVAL` | No | `10s` | Interval between blockchain polls |
| `START_BLOCK` | No | `-1` | Starting block (see below) |
| `PORT` | No | `8080` | API server port |
| `LOG_LEVEL` | No | `info` | Log level (`debug`/`info`/`warn`/`error`) |

### START_BLOCK Behavior

| Value | Behavior |
|-------|----------|
| `-1` | Use `updatedAtBlock` from deployment JSON (recommended for existing deployments) |
| `0` | Start from the latest block (only index new events going forward) |
| `>0` | Start from a specific block number (useful for historical indexing) |

**Examples:**
- New deployment with no history: `START_BLOCK=0`
- Existing deployment on sepolia: `START_BLOCK=-1` (will use block from deployment JSON)
- Historical backfill: `START_BLOCK=10000000`

### Deployment Selection

The `CONTRACTS_ENV` variable selects which contract address to use:

| Value | Network | Contract Address |
|-------|---------|------------------|
| `local` | Local testnet (port 8545) | From `packages/types/src/generated/deployments/local.json` |
| `sepolia` | Sepolia testnet | From `packages/types/src/generated/deployments/sepolia.json` |
| `mainnet` | Ethereum mainnet | From `packages/types/src/generated/deployments/mainnet.json` (not yet available) |

## Quick Start

### 1. Set up PostgreSQL

```bash
# Using Docker
docker run -d --name olla-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=olla_indexer_testnet \
  -p 5432:5432 \
  postgres:14
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run Migrations

```bash
make migrate-up
```

### 4. Run the Service

```bash
make run
```

The service will:
1. Start the API server on `:8080`
2. Start the indexer as a background goroutine
3. Begin polling for events from the configured starting block

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy"
}
```

### Get Deposits by Address

```
GET /api/v1/deposits/:address
```

Query Parameters:
- `limit` (optional): Max results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "deposits": [
    {
      "id": 1,
      "tx_hash": "0x...",
      "block_number": 12345,
      "log_index": 0,
      "caller": "0x...",
      "recipient": "0x...",
      "assets": "1000000000000000000",
      "shares": "950000000000000000",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Get Withdrawals by Address

```
GET /api/v1/withdrawals/:address
```

Query Parameters:
- `status` (optional): Filter by status (`pending`/`completed`)
- `limit` (optional): Max results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

Response:
```json
{
  "withdrawals": [
    {
      "id": 1,
      "request_id": 42,
      "tx_hash": "0x...",
      "block_number": 12346,
      "log_index": 0,
      "event_type": "withdrawal_requested",
      "owner": "0x...",
      "recipient": "0x...",
      "shares": "1000000000000000000",
      "assets_expected": "950000000000000000",
      "exchange_rate": "1050000000000000000",
      "status": "pending",
      "created_at": "2024-01-15T11:00:00Z"
    }
  ],
  "total": 1
}
```

### Get Pending Withdrawals

```
GET /api/v1/withdrawals/:address/pending
```

Returns only pending withdrawals for the given address.

## Development

### Run Tests

```bash
make test
```

### Generate Swagger Docs

```bash
make swagger
```

### Create New Migration

```bash
make migrate-create NAME=add_new_table
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        main.go                          │
│  ┌─────────────────┐     ┌─────────────────────────┐   │
│  │   Config Load    │────▶│   Initialize Dependencies│   │
│  └─────────────────┘     └─────────────────────────┘   │
│                                    │                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │                   API Server                     │   │
│  │              (Gin on :8080)                      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │                 Indexer (goroutine)              │   │
│  │  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │   │
│  │  │ ETH RPC   │─▶│ Parse     │─▶│ PostgreSQL  │  │   │
│  │  │ Poll Loop │  │ Events    │  │ Store       │  │   │
│  │  └───────────┘  └───────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### deposits

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `tx_hash` | VARCHAR(66) | Transaction hash (unique) |
| `block_number` | BIGINT | Block number |
| `log_index` | INTEGER | Log index in block |
| `caller` | VARCHAR(42) | Address that initiated deposit |
| `recipient` | VARCHAR(42) | Address receiving shares |
| `assets` | NUMERIC(78,0) | Amount of assets deposited |
| `shares` | NUMERIC(78,0) | Amount of shares minted |
| `created_at` | TIMESTAMP | Record creation time |

### withdrawal_requests

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key |
| `request_id` | BIGINT | Request ID (unique, may be NULL for instant) |
| `tx_hash` | VARCHAR(66) | Transaction hash |
| `block_number` | BIGINT | Block number |
| `log_index` | INTEGER | Log index in block |
| `event_type` | VARCHAR(30) | Event type |
| `owner` | VARCHAR(42) | Owner address |
| `recipient` | VARCHAR(42) | Recipient address |
| `shares` | NUMERIC(78,0) | Shares amount |
| `assets_expected` | NUMERIC(78,0) | Expected assets |
| `assets_claimed` | NUMERIC(78,0) | Actual assets claimed |
| `fee` | NUMERIC(78,0) | Fee (for instant) |
| `gross_assets` | NUMERIC(78,0) | Gross assets (for instant) |
| `net_assets` | NUMERIC(78,0) | Net assets (for instant) |
| `exchange_rate` | NUMERIC(78,0) | Exchange rate at event time |
| `status` | VARCHAR(20) | Status (`pending`/`completed`) |
| `created_at` | TIMESTAMP | Record creation time |
| `completed_at` | TIMESTAMP | Completion time |

### indexer_state

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `contract` | VARCHAR(42) | Contract address (unique) |
| `last_block` | BIGINT | Last processed block |
| `updated_at` | TIMESTAMP | Last update time |

## Deployment

### Docker

```bash
docker build -t olla-indexer .
docker run -p 8080:8080 --env-file .env olla-indexer
```

### Kubernetes

See `k8s/` directory for Kubernetes manifests.

## License

Proprietary - Olla Finance