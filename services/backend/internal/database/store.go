package database

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/database/stores"
)

type Store struct {
	Contracts    *stores.ContractStore
	Deposits     *stores.DepositStore
	Withdrawals  *stores.WithdrawalStore
	IndexerState *stores.IndexerStateStore
	db           *pgxpool.Pool
}

func NewStore(db *pgxpool.Pool) *Store {
	return &Store{
		Contracts:    stores.NewContractStore(db),
		Deposits:     stores.NewDepositStore(db),
		Withdrawals:  stores.NewWithdrawalStore(db),
		IndexerState: stores.NewIndexerStateStore(db),
		db:           db,
	}
}

func (s *Store) Close() {
	if s.db != nil {
		s.db.Close()
	}
}
