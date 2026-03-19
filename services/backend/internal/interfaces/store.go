// Package interfaces defines contracts for infrastructure components.
//
// These interfaces enable:
//   - Dependency Inversion Principle (DIP): High-level modules depend on abstractions
//   - Interface Segregation Principle (ISP): Small, focused interfaces
//   - Testability: Easy mocking in unit tests
//   - Flexibility: Swapping implementations without changing callers
//
// ARCHITECTURE NOTE: Services Layer Interfaces
//
// When adding a services layer, these store interfaces will be consumed by services,
// not directly by handlers:
//
//	// internal/services/deposit_service.go
//	type DepositService struct {
//	    store interfaces.DepositStore
//	}
//
//	// internal/handlers/deposits.go
//	type DepositHandler struct {
//	    service *services.DepositService  // Handler depends on service, not store
//	}
package interfaces

import (
	"context"

	"github.com/ollafinance/ui/services/backend/internal/models"
)

type DepositStore interface {
	Insert(ctx context.Context, deposit *models.Deposit) error
	GetByRecipient(ctx context.Context, recipient string, limit, offset int) ([]models.Deposit, int64, error)
	GetByTxHash(ctx context.Context, txHash string) (*models.Deposit, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}

type WithdrawalStore interface {
	Insert(ctx context.Context, wr *models.WithdrawalRequest) error
	GetByRequestID(ctx context.Context, requestID int64) (*models.WithdrawalRequest, error)
	UpdateToCompleted(ctx context.Context, requestID int64, txHash string, assetsClaimed *string, blockNumber int64, logIndex int) error
	GetByOwner(ctx context.Context, owner string, status *models.WithdrawalStatus, limit, offset int) ([]models.WithdrawalRequest, int64, error)
	GetByRecipient(ctx context.Context, recipient string, status *models.WithdrawalStatus, limit, offset int) ([]models.WithdrawalRequest, int64, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}

type ContractStore interface {
	Upsert(ctx context.Context, address string, deployedAtBlock *int64) error
	GetByVersion(ctx context.Context, version int) (*models.Contract, error)
	GetLatestVersion(ctx context.Context) (int, error)
}

type IndexerStateStore interface {
	Get(ctx context.Context, contract string) (*models.IndexerState, error)
	Upsert(ctx context.Context, contract string, lastBlock int64) error
	GetLastBlock(ctx context.Context, contract string) (int64, error)
	Initialize(ctx context.Context, contract string, startBlock int64) error
}

type Store interface {
	Deposits() DepositStore
	Withdrawals() WithdrawalStore
	Contracts() ContractStore
	IndexerState() IndexerStateStore
	Close()
}
