// Package app provides dependency injection container and application initialization.
//
// This package follows the Dependency Inversion Principle (DIP) by centralizing
// all dependency creation in one place, making it easy to:
//   - Swap implementations (e.g., mock stores for testing)
//   - Control initialization order
//   - Manage resource lifecycle (startup/shutdown)
//
// Usage:
//
//	deps, err := app.Initialize(ctx)
//	if err != nil {
//	    log.Fatal(err)
//	}
//	defer deps.Close()
//
// ARCHITECTURE NOTE: Adding Services Layer
//
// When business logic complexity grows, add a services layer:
//
//	type Dependencies struct {
//	    // ... existing fields
//	    Services *services.Services
//	}
//
//	func Initialize(ctx context.Context) (*Dependencies, error) {
//	    // ... existing initialization
//
//	    // Services layer sits between handlers and stores
//	    svcs := services.NewServices(
//	        services.WithDepositStore(deps.Store.Deposits),
//	        services.WithWithdrawalStore(deps.Store.Withdrawals),
//	    )
//	    deps.Services = svcs
//
//	    return deps, nil
//	}
//
// Then inject services into handlers instead of stores:
//
//	func SetupRouter(deps *router.RouterDeps) {
//	    handlers.RegisterDeposits(api, deps.Services.Deposits)  // Service, not Store
//	}
package app

import (
	"context"
	"fmt"

	"github.com/ollafinance/ui/services/backend/internal/config"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/indexer"
)

type Dependencies struct {
	Config     *config.Config
	Deployment *config.Deployment
	DB         *database.DB
	Store      *database.Store
	Indexer    *indexer.Indexer
	ABIPath    string
}

func Initialize(ctx context.Context) (*Dependencies, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}

	deployment, err := config.LoadDeployment(cfg.ContractsEnv)
	if err != nil {
		return nil, fmt.Errorf("failed to load deployment: %w", err)
	}

	contractABI, abiPath, err := indexer.LoadABIFromRelativePath()
	if err != nil {
		return nil, fmt.Errorf("failed to load ABI: %w", err)
	}

	db, err := database.NewConnection(ctx, cfg.DatabaseURL())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.RunMigrations(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	store := database.NewStore(db.Pool)

	idx, err := indexer.NewIndexer(cfg, deployment, store, contractABI)
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to create indexer: %w", err)
	}

	return &Dependencies{
		Config:     cfg,
		Deployment: deployment,
		DB:         db,
		Store:      store,
		Indexer:    idx,
		ABIPath:    abiPath,
	}, nil
}

func (d *Dependencies) Close() {
	if d.Indexer != nil {
		d.Indexer.Stop()
	}
	if d.Store != nil {
		d.Store.Close()
	}
	if d.DB != nil {
		d.DB.Close()
	}
}
