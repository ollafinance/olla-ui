// Package interfaces defines contracts for infrastructure components.
package interfaces

import (
	"context"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/core/types"
)

// EthClient defines the interface for Ethereum blockchain interactions.
//
// This interface abstracts the Ethereum client, enabling:
//   - Testability: Mock implementations for unit testing
//   - Flexibility: Swapping between different client implementations
//   - Clear contracts: Explicit method signatures
//
// Currently implemented by: *ethclient.Client
//
// ARCHITECTURE NOTE: Services Layer
//
// When adding a services layer, this interface would be consumed by IndexerService:
//
//	type IndexerService struct {
//	    ethClient interfaces.EthClient
//	    store     interfaces.Store
//	}
type EthClient interface {
	BlockNumber(ctx context.Context) (uint64, error)
	FilterLogs(ctx context.Context, q ethereum.FilterQuery) ([]types.Log, error)
	Close()
}

// EthClientWrapper wraps *ethclient.Client to implement EthClient interface.
// Use this when you need to pass a concrete ethclient.Client to functions
// expecting the EthClient interface.
type EthClientWrapper struct {
	client interface {
		BlockNumber(ctx context.Context) (uint64, error)
		FilterLogs(ctx context.Context, q ethereum.FilterQuery) ([]types.Log, error)
		Close()
	}
}

func NewEthClientWrapper(client interface {
	BlockNumber(ctx context.Context) (uint64, error)
	FilterLogs(ctx context.Context, q ethereum.FilterQuery) ([]types.Log, error)
	Close()
}) *EthClientWrapper {
	return &EthClientWrapper{client: client}
}

func (w *EthClientWrapper) BlockNumber(ctx context.Context) (uint64, error) {
	return w.client.BlockNumber(ctx)
}

func (w *EthClientWrapper) FilterLogs(ctx context.Context, q ethereum.FilterQuery) ([]types.Log, error) {
	return w.client.FilterLogs(ctx, q)
}

func (w *EthClientWrapper) Close() {
	w.client.Close()
}
