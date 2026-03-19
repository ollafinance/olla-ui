package stores

import (
	"context"
	"strconv"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type ContractStore struct {
	db *pgxpool.Pool
}

func NewContractStore(db *pgxpool.Pool) *ContractStore {
	return &ContractStore{db: db}
}

func (s *ContractStore) Upsert(ctx context.Context, address string, deployedAtBlock *int64) error {
	var currentVersion int
	err := s.db.QueryRow(ctx, `SELECT COALESCE(MAX(version), 0) FROM contracts`).Scan(&currentVersion)
	if err != nil && err != pgx.ErrNoRows {
		return models.NewDatabaseError("query", "contracts", err)
	}

	query := `
		INSERT INTO contracts (address, version, deployed_at_block, first_indexed_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (address) DO NOTHING
	`
	_, err = s.db.Exec(ctx, query, address, currentVersion+1, deployedAtBlock)
	if err != nil {
		return models.NewDatabaseError("upsert", "contracts", err)
	}

	return nil
}

func (s *ContractStore) GetByVersion(ctx context.Context, version int) (*models.Contract, error) {
	query := `
		SELECT id, address, version, deployed_at_block, first_indexed_at, notes
		FROM contracts
		WHERE version = $1
	`

	var c models.Contract
	err := s.db.QueryRow(ctx, query, version).Scan(
		&c.ID, &c.Address, &c.Version, &c.DeployedAtBlock, &c.FirstIndexedAt, &c.Notes,
	)
	if err == pgx.ErrNoRows {
		return nil, models.NewNotFoundError("contract", strconv.Itoa(version))
	}
	if err != nil {
		return nil, models.NewDatabaseError("query", "contracts", err)
	}

	return &c, nil
}

func (s *ContractStore) GetLatestVersion(ctx context.Context) (int, error) {
	query := `SELECT COALESCE(MAX(version), 0) FROM contracts`
	var version int
	err := s.db.QueryRow(ctx, query).Scan(&version)
	if err != nil {
		return 0, models.NewDatabaseError("query", "contracts", err)
	}
	return version, nil
}
