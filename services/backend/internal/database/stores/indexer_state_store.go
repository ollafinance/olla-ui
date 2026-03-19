package stores

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type IndexerStateStore struct {
	db *pgxpool.Pool
}

func NewIndexerStateStore(db *pgxpool.Pool) *IndexerStateStore {
	return &IndexerStateStore{db: db}
}

func (s *IndexerStateStore) Get(ctx context.Context, contract string) (*models.IndexerState, error) {
	query := `
		SELECT id, contract, last_block, updated_at
		FROM indexer_state
		WHERE contract = $1
	`

	var state models.IndexerState
	err := s.db.QueryRow(ctx, query, contract).Scan(&state.ID, &state.Contract, &state.LastBlock, &state.UpdatedAt)
	if err == pgx.ErrNoRows {
		return nil, models.NewNotFoundError("indexer_state", contract)
	}
	if err != nil {
		return nil, models.NewDatabaseError("query", "indexer_state", err)
	}

	return &state, nil
}

func (s *IndexerStateStore) Upsert(ctx context.Context, contract string, lastBlock int64) error {
	query := `
		INSERT INTO indexer_state (contract, last_block, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (contract) DO UPDATE SET
			last_block = EXCLUDED.last_block,
			updated_at = NOW()
	`

	_, err := s.db.Exec(ctx, query, contract, lastBlock)
	if err != nil {
		return models.NewDatabaseError("upsert", "indexer_state", err)
	}

	return nil
}

func (s *IndexerStateStore) GetLastBlock(ctx context.Context, contract string) (int64, error) {
	state, err := s.Get(ctx, contract)
	if err != nil {
		if _, ok := err.(*models.NotFoundError); ok {
			return 0, nil
		}
		return 0, err
	}
	return state.LastBlock, nil
}

func (s *IndexerStateStore) Initialize(ctx context.Context, contract string, startBlock int64) error {
	state, err := s.Get(ctx, contract)
	if err != nil {
		if _, ok := err.(*models.NotFoundError); ok {
			return s.Upsert(ctx, contract, startBlock)
		}
		return err
	}

	_ = state
	return nil
}
