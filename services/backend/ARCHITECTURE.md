# Olla Backend — Architecture & Design

This document provides a comprehensive reference for the design decisions, code structure, and internal architecture of the `services/backend` Go service.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Folder Structure](#2-folder-structure)
3. [Architecture & Design Patterns](#3-architecture--design-patterns)
4. [Entry Point](#4-entry-point)
5. [Internal Packages](#5-internal-packages)
   - [app — Composition Root](#51-app--composition-root)
   - [config — Configuration](#52-config--configuration)
   - [server — HTTP Lifecycle](#53-server--http-lifecycle)
   - [router — Route Registration](#54-router--route-registration)
   - [handlers — HTTP Handlers](#55-handlers--http-handlers)
   - [middleware — CORS](#56-middleware--cors)
   - [models — Domain Types](#57-models--domain-types)
   - [database — DB Layer](#58-database--db-layer)
   - [interfaces — Abstraction Contracts](#59-interfaces--abstraction-contracts)
   - [indexer — Ethereum Event Indexer](#510-indexer--ethereum-event-indexer)
6. [HTTP API](#6-http-api)
7. [Database Schema](#7-database-schema)
8. [Indexer Design](#8-indexer-design)
9. [Configuration Reference](#9-configuration-reference)
10. [OpenAPI / API Docs](#10-openapi--api-docs)
11. [Makefile Targets](#11-makefile-targets)
12. [Dockerfile](#12-dockerfile)
13. [Kubernetes Deployment](#13-kubernetes-deployment)
14. [Key Design Decisions](#14-key-design-decisions)

---

## 1. Overview

The backend is a Go service with two responsibilities that run concurrently:

- **Indexer** — polls an Ethereum RPC endpoint for on-chain events emitted by the `OllaVault` and `OllaCore` contracts, decodes them, and persists them to PostgreSQL.
- **API Server** — serves the indexed data via a versioned REST API, including an APY computation endpoint.

The service is designed to be **resumable** (tracks last processed block per contract), **idempotent** (all inserts use `ON CONFLICT DO NOTHING`), and **observable** (OpenAPI docs auto-generated at startup with no code-gen step).

---

## 2. Folder Structure

```
services/backend/
├── cmd/
│   └── main.go                          # Application entry point
├── internal/
│   ├── app/
│   │   └── dependencies.go              # Composition root / DI container
│   ├── config/
│   │   ├── config.go                    # Env-var loading → Config struct
│   │   └── deployments.go               # Deployment JSON loading & address helpers
│   ├── database/
│   │   ├── connection.go                # pgxpool setup & health check
│   │   ├── migrations.go                # Programmatic tern migration runner
│   │   ├── store.go                     # Store aggregate (composes all sub-stores)
│   │   └── stores/
│   │       ├── deposit_store.go         # SQL: deposits table CRUD
│   │       ├── withdrawal_store.go      # SQL: withdrawal_requests table CRUD
│   │       ├── contract_store.go        # SQL: contracts table CRUD
│   │       ├── indexer_state_store.go   # SQL: indexer_state table CRUD
│   │       └── accounting_update_store.go # SQL: accounting_updates table CRUD
│   ├── handlers/
│   │   ├── health.go                    # GET /health
│   │   ├── deposits.go                  # GET /api/v1/deposits/{address}
│   │   ├── withdrawals.go               # GET /api/v1/withdrawals/{address}[/pending]
│   │   └── apy.go                       # GET /api/v1/apy/{contract}
│   ├── indexer/
│   │   ├── indexer.go                   # Core poll loop & block range logic
│   │   ├── events.go                    # ABI loading & event signature hashing
│   │   └── handlers.go                  # ABI unpacking → model conversion
│   ├── interfaces/
│   │   ├── store.go                     # Go interfaces for all store types
│   │   └── ethereum.go                  # EthClient interface + wrapper
│   ├── middleware/
│   │   └── cors.go                      # Exportable CORS gin.HandlerFunc
│   ├── models/
│   │   ├── deposit.go                   # Deposit struct & DepositList
│   │   ├── withdrawal.go                # WithdrawalRequest, EventType, WithdrawalStatus
│   │   ├── contract.go                  # Contract struct
│   │   ├── indexer_state.go             # IndexerState struct
│   │   ├── accounting_update.go         # AccountingUpdate, ApyResponse
│   │   └── errors.go                    # NotFoundError, DatabaseError typed errors
│   ├── router/
│   │   └── router.go                    # Gin engine setup, huma API config, route registration
│   └── server/
│       └── server.go                    # http.Server wrapper with graceful shutdown
├── migrations/
│   ├── 001_initial_schema.sql           # contracts, deposits, withdrawal_requests, indexer_state
│   └── 002_accounting_updates.sql       # accounting_updates table + indexes
├── k8s/
│   ├── base/                            # Environment-agnostic K8s resources
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── httproute.yaml
│   │   ├── certificate.yaml
│   │   ├── security-policy.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       └── testnet/
│           └── kustomization.yaml       # Testnet-specific patches
├── Makefile
├── Dockerfile                           # Multi-stage builder → alpine runtime
├── go.mod                               # Module: github.com/ollafinance/ui/services/backend
├── go.sum
├── tern.conf                            # tern migration config (reads env via template)
├── env.example
└── README.md
```

---

## 3. Architecture & Design Patterns

### Layered Architecture

The service uses a clean **layered architecture** with explicit, top-down dependency flow. No layer reaches upward.

```
┌────────────────────────────────────────────┐
│  cmd/main.go  (orchestration only)         │
│    └── app.Initialize()  ← composition root│
├────────────────────────────────────────────┤
│  HTTP Layer                                │
│    router/   handlers/   middleware/       │
├────────────────────────────────────────────┤
│  (Services layer — documented, planned)    │
├────────────────────────────────────────────┤
│  Store Layer (database/stores/)            │
│    DepositStore  WithdrawalStore  ...      │
├────────────────────────────────────────────┤
│  Database  (database/connection.go)        │
│    pgxpool.Pool                            │
└────────────────────────────────────────────┘

Parallel subsystem:
┌────────────────────────────────────────────┐
│  Indexer goroutine                         │
│    indexer/ → database/stores/             │
└────────────────────────────────────────────┘
```

### Design Patterns Applied

| Pattern | Where | Notes |
|---|---|---|
| **Composition Root** | `internal/app/dependencies.go` | Single wiring point; all dependencies constructed and injected here; no global state |
| **Repository Pattern** | `internal/database/stores/` | One store struct per entity; holds only a `*pgxpool.Pool`; SQL written inline (no ORM) |
| **Store Aggregate** | `database.Store` | Single struct composing all five sub-stores, providing a single injection point into handlers |
| **Interface Segregation** | `internal/interfaces/` | Narrow per-entity interfaces (`DepositStore`, `WithdrawalStore`, etc.) defined for future test mocking and a services layer |
| **Typed Domain Errors** | `internal/models/errors.go` | `NotFoundError` and `DatabaseError` as concrete structs implementing `error`; enables type-switch error handling |
| **Stop-channel Pattern** | `indexer.Indexer.stopCh` | `Stop()` sends on `chan struct{}` to cleanly exit the polling goroutine's `select` loop |
| **Graceful Shutdown** | `server/server.go` | `SIGINT`/`SIGTERM` triggers `http.Server.Shutdown()` with a 30-second drain timeout |
| **Idempotent Writes** | All `Insert()` store methods | `ON CONFLICT DO NOTHING` — safe to re-run the indexer from any block without duplicates |

---

## 4. Entry Point

**`cmd/main.go`** is 44 lines of pure orchestration — no business logic.

```
1. app.Initialize(ctx)             → build all dependencies (returns *Dependencies)
2. defer deps.Close()              → cleanup on exit
3. go deps.Indexer.Start(ctx)      → start blockchain polling loop as goroutine
4. router.Setup(&RouterDeps{...})  → build gin.Engine with all routes
5. server.NewServer(engine, port)  → wrap http.Server
6. srv.RunWithGracefulShutdown()   → block until SIGINT/SIGTERM
```

The indexer and API server are fully independent — the API is available immediately (even while the indexer is catching up on historical blocks).

---

## 5. Internal Packages

### 5.1 `app` — Composition Root

**`internal/app/dependencies.go`**

The `Dependencies` struct holds every top-level dependency:

```go
type Dependencies struct {
    Config     *config.Config
    Deployment *config.Deployment
    DB         *database.DB
    Store      *database.Store
    Indexer    *indexer.Indexer
    ABIPath    string
}
```

`Initialize(ctx)` wires everything in strict order:

```
config.Load()
  → config.LoadDeployment(cfg.ContractsEnv)
  → indexer.LoadABIFromRelativePath()
  → database.NewConnection(ctx, cfg.DatabaseURL())
  → db.RunMigrations(ctx)
  → database.NewStore(db.Pool)
  → indexer.NewIndexer(cfg, deployment, store, abiPath)
```

`Close()` stops the indexer (via `stopCh`) then closes the DB pool. `Store.Close()` is intentionally **not** called here because it shares the same pool as `DB`.

> **Architecture Note (in source):** The file contains detailed comments explaining how to add a services layer between handlers and stores in the future, and how `Dependencies` would change to expose service interfaces rather than store types directly.

---

### 5.2 `config` — Configuration

**`config.go`**

`Config` struct fields:

| Category | Fields |
|---|---|
| Database | `PostgresHost`, `PostgresPort`, `PostgresDBName`, `PostgresUser`, `PostgresPassword`, `PostgresSSL` |
| Ethereum | `RPCURL` |
| Contracts | `ContractsEnv` (`local` / `sepolia` / `mainnet`) |
| Indexer | `PollInterval` (`time.Duration`), `StartBlock` (`int64`) |
| Server | `Port`, `LogLevel` |

`Load()` behaviour:
- Only calls `godotenv.Load()` when `ENVIRONMENT != "production"` — `.env` file is never loaded in production
- `POSTGRES_PASSWORD` and `RPC_URL` are required; returns error if missing
- `POLL_INTERVAL` defaults to `10s`, parsed with `time.ParseDuration`
- `START_BLOCK` defaults to `-1` (meaning "use `updatedAtBlock` from deployment JSON")

`DatabaseURL()` generates a `postgres://user:pass@host:port/db?sslmode=...` connection string.

**`deployments.go`**

`Deployment` struct:

```go
type Deployment struct {
    Network        string
    ChainID        int
    Deployer       string
    Addresses      map[string]string    // e.g. "OllaVaultProxy" → "0x..."
    StAztecName    string
    StAztecVersion string
    Status         DeploymentStatus
}

type DeploymentStatus struct {
    Phase          string
    Completed      bool
    UpdatedAtBlock int              // used as default START_BLOCK when -1
    Flags          map[string]bool
}
```

`LoadDeployment(env)` reads from `../../packages/types/src/generated/deployments/{env}.json` relative to the backend working directory. The `DEPLOYMENTS_PATH` env var overrides this path for Docker/K8s where the repo layout is flattened.

Key methods:
- `OllaVaultAddress()` — looks up `"OllaVaultProxy"` in the `Addresses` map
- `WithdrawalQueueAddress()` — looks up `"WithdrawalQueueProxy"`
- `GetStartBlock(configuredBlock int64)` — three-case logic:
  - `> 0` → use the explicit value
  - `0` → use the current chain head ("only index new events going forward")
  - `-1` → use `Status.UpdatedAtBlock` from the deployment JSON

---

### 5.3 `server` — HTTP Lifecycle

**`internal/server/server.go`**

`Server` wraps `*http.Server` with production-ready timeouts:

| Timeout | Value |
|---|---|
| `ReadTimeout` | 30s |
| `WriteTimeout` | 30s |
| `IdleTimeout` | 60s |
| `ReadHeaderTimeout` | 10s |

`RunWithGracefulShutdown()`:
1. Starts `ListenAndServe` in a goroutine; errors go to a `serverErr` channel
2. `signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)`
3. `select` blocks on either a server error or OS signal
4. On signal: calls `Shutdown(ctx)` with a 30-second context timeout

---

### 5.4 `router` — Route Registration

**`internal/router/router.go`**

`RouterDeps` is the handler-layer injection point:

```go
type RouterDeps struct {
    Store *database.Store
}
```

`Setup(deps)` flow:
1. `gin.Default()` — Logger + Recovery middleware
2. `router.Use(corsMiddleware())` — CORS applied globally
3. `setupAPI(router)` — mounts a `huma.API` on the Gin engine
4. `registerRoutes(api, deps)` — registers all handlers

**OpenAPI configuration (huma):**
- Title: `"Olla Indexer API"`, Version: `"1.0.0"`
- Auto-serves `/docs` (interactive Scalar UI), `/openapi.json`, `/openapi.yaml`

> **Note on CORS duplication:** `corsMiddleware()` is defined inline in `router.go`. An identical `middleware.CORS()` also exists in `internal/middleware/cors.go` but is not currently used — it is present as a named exportable symbol for future use.

---

### 5.5 `handlers` — HTTP Handlers

All handlers use the **[huma v2](https://github.com/danielgtaylor/huma)** framework pattern:

- A strongly-typed `Input` struct annotated with path/query/doc/validation tags
- A strongly-typed `Output` struct wrapping the response body
- Registration via `huma.Register(api, huma.Operation{...}, handlerFunc)`

This approach drives OpenAPI schema generation entirely from Go types — no annotations separate from the code.

**`health.go`**
- `HealthOutput.Body.Status string` → always `"healthy"`
- OperationID: `health-check`

**`deposits.go`**
- Input: `address` (path, max 42 chars), `limit` (query, default 100, max 1000), `offset` (query, default 0)
- Output: `models.DepositList`
- Calls: `store.Deposits.GetByRecipient(ctx, address, limit, offset)`

**`withdrawals.go`**
- Input: `address` (path), optional `status` query (enum: `pending|completed`), `limit`, `offset`
- Two registered endpoints:
  - Base address query (with optional status filter)
  - `/pending` shortcut (hardcodes `status := models.StatusPending` via an anonymous inline input struct)
- Calls: `store.Withdrawals.GetByOwner(ctx, address, statusPtr, limit, offset)`

**`apy.go`** (153 lines — most complex handler)
- Input: `contract` (path, Ethereum address)
- Validates with `common.IsHexAddress()`; normalises to EIP-55 checksum via `common.HexToAddress().Hex()`
- Output: `models.ApyResponse` — fields: `Apy` (percentage string), `Strategy` (enum string), `IsLive` (bool)

APY computation in `computeApy()` implements a **3-strategy cascade**:

| Priority | Strategy | Condition | Logic |
|---|---|---|---|
| 1 | `multi_event` | ≥ 2 `AccountingUpdated` events AND elapsed ≥ 1 hour | Compound: `APY = (rate₁/rate₀)^(seconds_per_year/elapsed) − 1` |
| 2 | `single_report` | ≥ 1 event | Annualise single event's `grossRewards/totalAssets` against wall clock |
| 3 | `none` | No events | Returns `Apy: ""`, `IsLive: false` |

Key constants: `secondsPerYear = 365.25 × 24 × 3600`, `minPeriodSeconds = 1 hour`, `exchangeRateScale = 1e18`. APY is capped at 10,000% via `isValidApy()`. `parseExchangeRate()` uses `math/big` to safely divide 18-decimal integers by `1e18`.

---

### 5.6 `middleware` — CORS

**`internal/middleware/cors.go`**

Standalone `middleware.CORS()` exportable function. Sets `Access-Control-Allow-*` headers and responds `204` to `OPTIONS` preflight requests. Currently unused (the router defines an identical inline copy), but present for clean export if the middleware is ever needed independently.

---

### 5.7 `models` — Domain Types

All models are plain structs with `json:` tags and `doc:` annotations (consumed by huma for OpenAPI schema generation). All large numeric values (assets, shares, exchange rates) are typed as Go `string` rather than numeric types, to safely represent 256-bit Ethereum integers.

| Model | Notable Fields |
|---|---|
| `Deposit` | `Assets string`, `Shares string`, `Caller`, `Recipient`, `TxHash`, `BlockNumber`, `LogIndex` |
| `WithdrawalRequest` | `EventType` (typed string: `withdrawal_claimed` / `instant_redemption` / `redeem_request`), `Status` (`pending` / `completed`), nullable fields as pointer types (`*string`, `*int64`, `*time.Time`) |
| `AccountingUpdate` | `TotalAssets`, `ExchangeRate`, `GrossRewards`, `NetFlows`, `ProtocolFeeAssets`, `TreasuryShares`, `ProviderShares` (all strings), `EventTimestamp int64` (Unix seconds from on-chain event) |
| `ApyResponse` | `Apy string`, `Strategy string`, `IsLive bool` |

**`errors.go`** — two typed error types:
- `NotFoundError{Resource, ID string}` — for "row not found"
- `DatabaseError{Operation, Table string, Err error}` — wraps driver errors with context

---

### 5.8 `database` — DB Layer

#### Connection (`connection.go`)

`DB{Pool *pgxpool.Pool}` — `NewConnection(ctx, databaseURL)` configures the pool:

| Setting | Value |
|---|---|
| `MaxConns` | 50 |
| `MinConns` | 5 |
| `MaxConnLifetime` | 1 hour |
| `MaxConnIdleTime` | 30 minutes |
| `HealthCheckPeriod` | 1 minute |
| `ConnectTimeout` | 10 seconds |

Pings the database before returning to fail fast on misconfiguration.

#### Migrations (`migrations.go`)

Uses `jackc/tern/v2/migrate` programmatically (not the CLI):
1. Acquires a connection from the pool
2. Creates a `migrate.Migrator` with version table `"schema_version"`
3. Loads SQL files from `os.DirFS("migrations")` (relative to working directory)
4. Calls `migrator.Migrate(ctx)` — runs all pending, skips already-applied
5. Logs the resulting schema version number

#### Store Aggregate (`store.go`)

```go
type Store struct {
    Contracts         *stores.ContractStore
    Deposits          *stores.DepositStore
    Withdrawals       *stores.WithdrawalStore
    IndexerState      *stores.IndexerStateStore
    AccountingUpdates *stores.AccountingUpdateStore
    db                *pgxpool.Pool    // unexported
}
```

`NewStore(db)` constructs all five sub-stores from the same pool. `Close()` closes the pool.

#### Sub-stores (`internal/database/stores/`)

All stores share the same structure:

```go
type XxxStore struct { db *pgxpool.Pool }
func NewXxxStore(db *pgxpool.Pool) *XxxStore { ... }
```

**`deposit_store.go`**
- `Insert()` — `ON CONFLICT (tx_hash) DO NOTHING`
- `GetByRecipient()` — ordered `block_number DESC, log_index DESC`; separate `COUNT(*)` for pagination total
- `GetByTxHash()` — single-row lookup; returns `NotFoundError` on miss
- `GetLatestBlock()` — `COALESCE(MAX(block_number), 0)` for indexer resume

**`withdrawal_store.go`**
- `Insert()` — `ON CONFLICT (tx_hash, log_index) DO NOTHING`
- `GetByRequestID()` — latest record for a given `request_id`
- `UpdateToCompleted()` — sets `status = 'completed'`, `assets_claimed`, `completed_at = NOW()` by `request_id`; returns `NotFoundError` if 0 rows affected
- `GetByOwner()` / `GetByRecipient()` — **dynamic query building** with `fmt.Sprintf` for optional `status` filter and dynamic positional parameters
- `GetLatestBlock()` — `COALESCE(MAX(block_number), 0)`

**`contract_store.go`**
- `Upsert()` — fetches current max version, increments, then `ON CONFLICT (address) DO NOTHING`
- `GetByVersion()` / `GetLatestVersion()` — version-based lookups

**`indexer_state_store.go`**
- `Upsert()` — `INSERT ... ON CONFLICT (contract) DO UPDATE SET last_block = EXCLUDED.last_block, updated_at = NOW()`
- `GetLastBlock()` — wraps `Get()`, returns `0` on `NotFoundError` (not an error condition — means "never indexed")
- `Initialize()` — only inserts if no existing record; preserves in-progress indexer state on restart

**`accounting_update_store.go`**
- `Insert()` — `ON CONFLICT (tx_hash, log_index) DO NOTHING`
- `GetLatestN(contract, n)` — subquery fetches the N newest rows by `event_timestamp DESC`; outer query returns them `ASC` (oldest-first) for APY computation. The ordering rationale is documented in a comment.

---

### 5.9 `interfaces` — Abstraction Contracts

**`internal/interfaces/store.go`** — defines narrow interfaces for all five store types plus a composite `Store` interface. The concrete `*stores.XxxStore` types are used directly throughout the codebase today; these interfaces exist in anticipation of a future services layer or test mocking.

> **Note on interface duplication:** Store interfaces appear in two places — `internal/interfaces/store.go` (canonical, for DI/mocking) and inside each `models/` file (e.g. `models/deposit.go`). The `internal/interfaces` package is the intended canonical location; the model-level declarations are legacy/transitional.

**`internal/interfaces/ethereum.go`**

```go
type EthClient interface {
    BlockNumber(ctx context.Context) (uint64, error)
    FilterLogs(ctx context.Context, q ethereum.FilterQuery) ([]types.Log, error)
    Close()
}
```

`EthClientWrapper` adapts any struct matching those three methods to satisfy the interface. Currently the concrete `*ethclient.Client` is used directly in `Indexer` — the wrapper is available for testing.

---

### 5.10 `indexer` — Ethereum Event Indexer

#### `events.go` — ABI Loading & Event Signature Computation

`LoadABIFromRelativePath()` loads the OllaVault ABI from `../../packages/types/src/generated/abis/OllaVault.json`. The `ABI_PATH` env var overrides this for Docker/K8s.

`LoadOllaCoreABI()` similarly loads `OllaCore.json`, overrideable via `OLLACORE_ABI_PATH`.

`GetEventSignatures()` computes `keccak256(canonicalSignature)` topic0 hashes at startup:

| Event | Canonical Signature |
|---|---|
| `Deposit` | `Deposit(address,address,uint256,uint256)` |
| `WithdrawalClaimed` | `WithdrawalClaimed(uint256,address,uint256)` |
| `InstantRedemption` | `InstantRedemption(address,address,uint256,uint256,uint256,uint256,uint256)` |
| `RedeemRequest` | `RedeemRequest(address,address,uint256,address,uint256)` |
| `AccountingUpdated` | `AccountingUpdated(uint256,uint256,uint256,int256,uint256,uint256,uint256,uint256)` |

`EventSignatures` exposes `IsXxx(topic string)` helpers using case-insensitive comparison (`strings.EqualFold`).

#### `handlers.go` — ABI Unpacking → Model Structs

`EventHandler` holds two ABIs (`abi` for OllaVault, `coreABI` for OllaCore) and `*EventSignatures`.

`IdentifyEventType(log)` compares `log.Topics[0]` hex against all known signatures, returning the event name string or `""`.

Each `ParseXxx()` method:
1. Extracts indexed topics (addresses) from `log.Topics[1..3]` via `common.BytesToAddress()`
2. Calls `event.Inputs.Unpack(log.Data)` to decode non-indexed fields
3. Type-asserts each unpacked field to `*big.Int`, `common.Address`, etc.
4. Converts `*big.Int` to `string` via `bigIntToStringPtr()` helper
5. Returns a fully populated model struct

`ParseAccountingUpdated()` unpacks all 8 non-indexed fields from `log.Data` (none are indexed in the Solidity event definition).

#### `indexer.go` — Core Polling Loop

`Indexer` struct:

```go
type Indexer struct {
    client       *ethclient.Client
    store        *database.Store
    handler      *EventHandler
    vaultAddr    common.Address
    coreAddr     common.Address
    abi          *abi.ABI
    pollInterval time.Duration
    startBlock   int64
    stopCh       chan struct{}
}
```

`NewIndexer()`:
1. `ethclient.Dial(cfg.RPCURL)` — connects to Ethereum RPC
2. Resolves `OllaVaultProxy` and `OllaCoreProxy` addresses from deployment JSON
3. Loads both ABIs
4. Calls `deployment.GetStartBlock()` to resolve the configured starting block
5. Constructs `EventHandler` and calls `handler.SetCoreABI(coreABI)`

`Start(ctx)`:
1. Upserts both contract addresses into the `contracts` table (satisfies FK constraints for all other tables)
2. Fetches `last_block` for both contracts from `indexer_state`
3. Uses `min(vaultLastBlock, coreLastBlock)` as the resume point — ensures a newly-watched contract doesn't skip historical events
4. Falls back to `startBlock` or the current chain head if `lastBlock == 0`
5. Runs `time.NewTicker(pollInterval)`; calls `poll()` on each tick
6. Returns on context cancellation or `stopCh` close

`poll(ctx, fromBlock)`:
1. Gets `currentBlock` from chain
2. Caps range to 10,000 blocks per poll (`if toBlock-fromBlock > 10000`)
3. Calls `getLogs()` — single `FilterLogs` call for both contract addresses, topic0-filtered for all 5 event signatures
4. Even if no logs: advances `indexer_state` for both contracts to `toBlock`
5. For each log: calls `processLog()`; errors are logged but do not halt processing
6. Returns `toBlock` as the new `lastBlock`

`processLog(ctx, log)` dispatches on the event type string:

```
"Deposit"           → ParseDeposit()          → store.Deposits.Insert()
"WithdrawalClaimed" → ParseWithdrawalClaimed() → store.Withdrawals.UpdateToCompleted()
                                               → store.Withdrawals.Insert()
"InstantRedemption" → ParseInstantRedemption() → store.Withdrawals.Insert()
"RedeemRequest"     → ParseRedeemRequest()     → store.Withdrawals.Insert()
"AccountingUpdated" → ParseAccountingUpdated() → store.AccountingUpdates.Insert()
```

`WithdrawalClaimed` performs a dual write: first `UpdateToCompleted()` (marks the originating `RedeemRequest` as done), then `Insert()` of the claim event itself. The update failure is logged as a warning, not fatal — the claim is still inserted.

---

## 6. HTTP API

### Full Route Table

| Method | Path | OperationID | Tags |
|---|---|---|---|
| `GET` | `/health` | `health-check` | `health` |
| `GET` | `/api/v1/deposits/{address}` | `get-deposits` | `deposits` |
| `GET` | `/api/v1/withdrawals/{address}` | `get-withdrawals` | `withdrawals` |
| `GET` | `/api/v1/withdrawals/{address}/pending` | `get-pending-withdrawals` | `withdrawals` |
| `GET` | `/api/v1/apy/{contract}` | `get-apy` | `apy` |
| `GET` | `/docs` | *(huma built-in)* | — |
| `GET` | `/openapi.json` | *(huma built-in)* | — |
| `GET` | `/openapi.yaml` | *(huma built-in)* | — |

### Middleware Stack (applied globally)

1. `gin.Logger()` — structured request logging
2. `gin.Recovery()` — panic recovery with 500 response
3. `corsMiddleware()` — `Access-Control-Allow-*` headers; `204` on `OPTIONS` preflight

### Query Parameters

**`GET /api/v1/deposits/{address}`**

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `limit` | int | 100 | 1000 | Results per page |
| `offset` | int | 0 | — | Pagination offset |

**`GET /api/v1/withdrawals/{address}`**

| Parameter | Type | Default | Enum | Description |
|---|---|---|---|---|
| `status` | string | — | `pending`, `completed` | Filter by status |
| `limit` | int | 100 | 1000 | Results per page |
| `offset` | int | 0 | — | Pagination offset |

---

## 7. Database Schema

### Tables

#### `contracts`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL` | PK |
| `address` | `VARCHAR(42)` | UNIQUE |
| `version` | `INT` | Auto-incremented on upsert |
| `deployed_at_block` | `BIGINT` | |
| `created_at` | `TIMESTAMPTZ` | |

#### `deposits`

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `contract` | `VARCHAR(42)` | FK → `contracts(address)` |
| `tx_hash` | `VARCHAR(66)` | UNIQUE |
| `block_number` | `BIGINT` | |
| `log_index` | `INT` | |
| `caller` | `VARCHAR(42)` | |
| `recipient` | `VARCHAR(42)` | |
| `assets` | `NUMERIC(78,0)` | Solidity uint256 |
| `shares` | `NUMERIC(78,0)` | Solidity uint256 |
| `created_at` | `TIMESTAMPTZ` | |

#### `withdrawal_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `contract` | `VARCHAR(42)` | FK → `contracts(address)` |
| `request_id` | `BIGINT` | Nullable; NOT unique (multiple event types share the same ID) |
| `tx_hash` | `VARCHAR(66)` | |
| `block_number` | `BIGINT` | |
| `log_index` | `INT` | |
| `event_type` | `VARCHAR(30)` | `withdrawal_claimed` / `instant_redemption` / `redeem_request` |
| `owner` | `VARCHAR(42)` | |
| `recipient` | `VARCHAR(42)` | Nullable |
| `shares` | `NUMERIC(78,0)` | Nullable |
| `assets_expected` | `NUMERIC(78,0)` | Nullable |
| `assets_claimed` | `NUMERIC(78,0)` | Nullable; set on completion |
| `fee` | `NUMERIC(78,0)` | Nullable; instant redemption only |
| `gross_assets` | `NUMERIC(78,0)` | Nullable; instant redemption only |
| `net_assets` | `NUMERIC(78,0)` | Nullable; instant redemption only |
| `exchange_rate` | `NUMERIC(78,0)` | Nullable |
| `status` | `VARCHAR(20)` | `pending` / `completed` |
| `created_at` | `TIMESTAMPTZ` | |
| `completed_at` | `TIMESTAMPTZ` | Nullable; set when claimed |

Unique constraint: `(tx_hash, log_index)`

#### `indexer_state`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL` | PK |
| `contract` | `VARCHAR(42)` | UNIQUE; FK → `contracts(address)` ON DELETE CASCADE |
| `last_block` | `BIGINT` | Last successfully processed block |
| `updated_at` | `TIMESTAMPTZ` | |

`ON DELETE CASCADE` — removing a contract entry clears its state automatically.

#### `accounting_updates`

| Column | Type | Notes |
|---|---|---|
| `id` | `BIGSERIAL` | PK |
| `contract` | `VARCHAR(42)` | FK → `contracts(address)` |
| `tx_hash` | `VARCHAR(66)` | |
| `block_number` | `BIGINT` | |
| `log_index` | `INT` | |
| `total_assets` | `NUMERIC(78,0)` | |
| `exchange_rate` | `NUMERIC(78,0)` | 18-decimal fixed point |
| `gross_rewards` | `NUMERIC(78,0)` | |
| `net_flows` | `NUMERIC(78,0)` | Signed (can be negative) |
| `protocol_fee_assets` | `NUMERIC(78,0)` | |
| `treasury_shares` | `NUMERIC(78,0)` | |
| `provider_shares` | `NUMERIC(78,0)` | |
| `event_timestamp` | `BIGINT` | Unix seconds from on-chain event |
| `created_at` | `TIMESTAMPTZ` | |

Unique constraint: `(tx_hash, log_index)`. Index: `(contract, event_timestamp DESC)` — optimises the APY `GetLatestN` query.

### Key Schema Design Choices

- `NUMERIC(78,0)` matches Solidity `uint256` exactly (max value ~1.157 × 10⁷⁷)
- All large integers are stored as `NUMERIC(78,0)` in Postgres and read as Go `string` — no float precision loss
- `withdrawal_requests.request_id` is intentionally NOT unique — `RedeemRequest` and `WithdrawalClaimed` events share the same `request_id`
- Migration versioning via tern's `schema_version` table; migrations are numbered and append-only

---

## 8. Indexer Design

### Polling vs. Subscriptions

The indexer uses **polling** (`eth_getLogs` / `FilterLogs`) rather than WebSocket subscriptions (`eth_subscribe`). This choice improves resilience across public and managed RPC providers that may rate-limit or drop WebSocket connections.

### Block Range Strategy

```
On each poll:
  fromBlock = lastBlock + 1
  toBlock   = min(currentChainHead, fromBlock + 10_000)

Resume logic on startup:
  lastBlock = min(vaultLastBlock, coreLastBlock)
            or startBlock     (if both are 0, first run)
            or currentHead    (if START_BLOCK=0)
```

The **10,000-block cap** prevents RPC timeouts and memory pressure during historical catch-ups. The **`min()` resume logic** ensures that when a new contract (e.g. OllaCore) is added to the indexer, it re-scans from the earlier of the two last-seen blocks — no historical events are skipped.

### Multi-Contract Filtering

A single `FilterLogs` call specifies both contract addresses and a topic0 filter matching all 5 event signatures:

```go
ethereum.FilterQuery{
    FromBlock: big.NewInt(fromBlock),
    ToBlock:   big.NewInt(toBlock),
    Addresses: []common.Address{vaultAddr, coreAddr},
    Topics:    [][]common.Hash{{sig.Deposit, sig.WithdrawalClaimed, ...}},
}
```

One RPC round-trip per poll interval, regardless of how many contracts are watched.

### Idempotency

All store `Insert()` operations use `ON CONFLICT DO NOTHING`. The indexer can be restarted from any block without creating duplicate records. `indexer_state.last_block` is updated after each successful poll, providing a resume cursor.

### Event Routing

`processLog()` identifies the event type via `IdentifyEventType()` (topic0 comparison) and dispatches to the appropriate parse + store path. Unknown event types are silently skipped (logged at debug level). Store errors for individual logs are logged but do not halt the poll loop — a single bad log does not stall the indexer.

---

## 9. Configuration Reference

### All Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `POSTGRES_HOST` | No | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | No | `5432` | PostgreSQL port |
| `POSTGRES_DB_NAME` | No | `olla_indexer_testnet` | Database name |
| `POSTGRES_USER` | No | `admin` | Database user |
| `POSTGRES_PASSWORD` | **Yes** | — | Database password |
| `POSTGRES_SSL_ENABLED` | No | `disable` | `disable` or `require` |
| `RPC_URL` | **Yes** | — | Ethereum JSON-RPC endpoint |
| `CONTRACTS_ENV` | No | `local` | `local` / `sepolia` / `mainnet` |
| `DEPLOYMENTS_PATH` | No | — | Override deployment JSON directory |
| `ABI_PATH` | No | — | Override OllaVault ABI file path |
| `OLLACORE_ABI_PATH` | No | — | Override OllaCore ABI file path |
| `POLL_INTERVAL` | No | `10s` | Go duration string (e.g. `30s`, `1m`) |
| `START_BLOCK` | No | `-1` | `-1` = deployment JSON block, `0` = latest, `>0` = explicit |
| `PORT` | No | `8080` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Currently loaded but not wired to a logger |
| `ENVIRONMENT` | No | — | Set to `production` to skip `.env` file loading |

### `.env` File Loading

`godotenv.Load()` is called only when `ENVIRONMENT` is not set to `"production"`. In Kubernetes, environment variables are injected via `env` / `envFrom` in the Deployment spec; the `.env` file is never present.

---

## 10. OpenAPI / API Docs

The service uses **[huma v2](https://github.com/danielgtaylor/huma)** — an OpenAPI-first HTTP framework that generates the OpenAPI 3.1 specification at runtime from Go type definitions. No code generation step or `make swagger` command is required.

Schema generation is driven by struct field tags:

| Tag | Purpose |
|---|---|
| `json:"..."` | Field name in JSON responses |
| `doc:"..."` | Field description in OpenAPI schema |
| `example:"..."` | Example value |
| `minimum:` / `maximum:` | Numeric validation |
| `default:` | Default value |
| `enum:` | Allowed values |
| `maxLength:` | String length constraint |

Endpoints served automatically at startup:

| Path | Content |
|---|---|
| `/docs` | Interactive Scalar API reference UI |
| `/openapi.json` | OpenAPI 3.1 JSON spec |
| `/openapi.yaml` | OpenAPI 3.1 YAML spec |

---

## 11. Makefile Targets

| Target | Command | Purpose |
|---|---|---|
| `run` | `go run ./cmd/main.go` | Run server with `go run` (no build step) |
| `build` | `go build -o bin/server ./cmd/main.go` | Compile binary to `bin/server` |
| `migrate-up` | `tern migrate --migrations ./migrations ...` | Apply all pending migrations |
| `migrate-down` | `tern migrate --destination -1 ...` | Roll back one migration |
| `migrate-create` | `tern migrate ... create $$name` | Scaffold a new numbered migration file |
| `clean` | `rm -rf bin/` | Remove compiled artifacts |
| `test` | `go test -v ./...` | Run all Go tests |

Both `migrate-up` and `migrate-down` source the `.env` file via `set -a && . ./.env && set +a` before invoking tern, so local dev credentials are automatically available.

---

## 12. Dockerfile

Multi-stage build for a minimal production image:

**Build stage** (`golang:1.25-alpine`)
- Installs `git` and `make`
- Downloads Go modules (cached layer)
- Installs `tern` CLI: `go install github.com/jackc/tern/v2@v2.2.3`
- Compiles binary: `CGO_ENABLED=0 GOOS=linux go build -o bin/server ./cmd/main.go`

**Runtime stage** (`alpine:3.19`)
- Adds `ca-certificates`, `tzdata`
- Copies from builder: `bin/server`, `tern` binary, `migrations/`, `tern.conf`, `deployments/`, `abis/`
- Exposes port `8080`
- `CMD ["./server"]`

Key decisions:
- `CGO_ENABLED=0` — fully static binary, no C runtime dependency
- `tern` is bundled into the runtime image so the Kubernetes init container can run migrations without a separate image
- `deployments/` and `abis/` are baked into the image at build time (the monorepo's generated files must be present in the Docker build context)

---

## 13. Kubernetes Deployment

### Structure

```
k8s/
├── base/               # Environment-agnostic resources
│   ├── deployment.yaml
│   ├── service.yaml    # ClusterIP on port 8080
│   ├── httproute.yaml  # Gateway API HTTPRoute
│   ├── certificate.yaml
│   ├── security-policy.yaml
│   └── kustomization.yaml
└── overlays/
    └── testnet/
        └── kustomization.yaml  # Namespace, image tag, env patches
```

### Key Design Decisions

**Init Container for Migrations**

The `Deployment` spec includes an init container (`run-migrations`) that runs `./tern migrate --config tern.conf --migrations migrations` before the main server container starts. This guarantees the schema is always up-to-date before the application boots — no separate migration job is needed.

**Gateway API (not Ingress)**

The service uses the Kubernetes Gateway API (`HTTPRoute` at `gateway.networking.k8s.io/v1`) rather than the older `networking.k8s.io/v1 Ingress` resource. The public hostname is `api.demo.olla.finance`.

**TLS**

A cert-manager `Certificate` resource issues a TLS certificate via `ClusterIssuer: olla-issuer-production`.

**CORS at Two Layers**

| Layer | Policy | Origin |
|---|---|---|
| Application (`corsMiddleware`) | Wildcard `*` | Development / local use |
| Envoy Gateway (`SecurityPolicy: olla-indexer-cors`) | Strict allow-list | `https://demo.olla.finance` only |

The gateway-level policy is the enforced production boundary. The application-level wildcard provides flexibility during local development.

**Secrets**

- `POSTGRES_PASSWORD` — injected via `secretKeyRef` from `postgres-auth`
- `RPC_URL` — from `olla-secrets-testnet`

**Resources**

| | CPU | Memory |
|---|---|---|
| Requests | 250m | 256Mi |
| Limits | 500m | 512Mi |

**Health Probes**

Both `livenessProbe` and `readinessProbe` target `GET /health`. Liveness begins at 10s; readiness at 5s.

**Testnet Overlay Patches**

| Setting | Value |
|---|---|
| Namespace | `olla-prod` |
| Image tag | `testnet-latest` |
| `POSTGRES_DB_NAME` | `olla_indexer_testnet` |
| `CONTRACTS_ENV` | `sepolia` |
| `START_BLOCK` | `10457986` (explicit Sepolia start block) |

---

## 14. Key Design Decisions

| Decision | Implementation | Rationale |
|---|---|---|
| Polling over WebSocket subscriptions | `time.NewTicker` + `FilterLogs` | More resilient across public RPC providers; naturally restartable |
| 10,000-block cap per poll | `if toBlock-fromBlock > 10000` | Prevents RPC timeouts and memory pressure during catch-up |
| `min()` resume for multi-contract | `lastBlock = min(vaultLastBlock, coreLastBlock)` | Adding a new contract to the indexer will not skip its historical events |
| `NUMERIC(78,0)` + Go `string` | All assets/shares/rates stored and transported as strings | Safe representation of 256-bit Solidity integers without any floating-point precision loss |
| `ON CONFLICT DO NOTHING` everywhere | All `Insert()` store methods | Re-running the indexer from any block is always safe; no duplicate records |
| huma v2 over swaggo | `danielgtaylor/huma/v2` | OpenAPI 3.1 derived from Go types at runtime; zero code-gen step; strongly-typed handler inputs and outputs |
| Typed errors (`NotFoundError`, `DatabaseError`) | `internal/models/errors.go` | Enables type-switch error handling without brittle string matching |
| Composition root | `internal/app/dependencies.go` | Single wiring point; documented path to introduce a services layer; no global state |
| `ENVIRONMENT=production` guard | Skips `godotenv.Load()` | Clean separation of local dev file loading from Kubernetes env injection |
| Dual CORS (app + gateway) | Wildcard in app; strict allow-list at Envoy | Development flexibility without compromising production security |
| `tern` bundled in Docker image | `COPY --from=builder /go/bin/tern .` | Allows the K8s init container to run migrations using the same image as the server |
| Interface definitions ahead of use | `internal/interfaces/` | Forward-compatible with test mocking and a services layer, even though concrete types are used directly today |
| APY 3-strategy cascade | `multi_event` → `single_report` → `none` | Degrades gracefully as event history grows; `IsLive` flag tells callers which tier is active |
| `WithdrawalClaimed` dual write | `UpdateToCompleted()` + `Insert()` | Links claim events back to their originating `RedeemRequest` row while preserving a full event log |
