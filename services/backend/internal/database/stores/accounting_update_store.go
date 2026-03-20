package stores

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type AccountingUpdateStore struct {
	db *pgxpool.Pool
}

func NewAccountingUpdateStore(db *pgxpool.Pool) *AccountingUpdateStore {
	return &AccountingUpdateStore{db: db}
}

func (s *AccountingUpdateStore) Insert(ctx context.Context, u *models.AccountingUpdate) error {
	query := `
		INSERT INTO accounting_updates (
			contract, tx_hash, block_number, log_index,
			total_assets, exchange_rate, gross_rewards, net_flows,
			protocol_fee_assets, treasury_shares, provider_shares, event_timestamp
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		ON CONFLICT (tx_hash, log_index) DO NOTHING
		RETURNING id, created_at
	`

	err := s.db.QueryRow(ctx, query,
		u.Contract,
		u.TxHash,
		u.BlockNumber,
		u.LogIndex,
		u.TotalAssets,
		u.ExchangeRate,
		u.GrossRewards,
		u.NetFlows,
		u.ProtocolFeeAssets,
		u.TreasuryShares,
		u.ProviderShares,
		u.EventTimestamp,
	).Scan(&u.ID, &u.CreatedAt)

	if err == pgx.ErrNoRows {
		// ON CONFLICT DO NOTHING — row already exists, not an error
		return nil
	}
	if err != nil {
		return models.NewDatabaseError("insert", "accounting_updates", err)
	}
	return nil
}

// GetLatestN returns the n most recent AccountingUpdate records for a contract,
// ordered by event_timestamp ascending (oldest first) so callers can compute
// APY by comparing index 0 (older) to index n-1 (newer).
func (s *AccountingUpdateStore) GetLatestN(ctx context.Context, contract string, n int) ([]models.AccountingUpdate, error) {
	if n <= 0 {
		return nil, fmt.Errorf("n must be > 0")
	}

	// Subquery selects the n newest rows; outer query returns them oldest-first.
	query := `
		SELECT id, contract, tx_hash, block_number, log_index,
		       total_assets, exchange_rate, gross_rewards, net_flows,
		       protocol_fee_assets, treasury_shares, provider_shares,
		       event_timestamp, created_at
		FROM (
			SELECT *
			FROM accounting_updates
			WHERE contract = $1
			ORDER BY event_timestamp DESC
			LIMIT $2
		) sub
		ORDER BY event_timestamp ASC
	`

	rows, err := s.db.Query(ctx, query, contract, n)
	if err != nil {
		return nil, models.NewDatabaseError("query", "accounting_updates", err)
	}
	defer rows.Close()

	var updates []models.AccountingUpdate
	for rows.Next() {
		var u models.AccountingUpdate
		err := rows.Scan(
			&u.ID, &u.Contract, &u.TxHash, &u.BlockNumber, &u.LogIndex,
			&u.TotalAssets, &u.ExchangeRate, &u.GrossRewards, &u.NetFlows,
			&u.ProtocolFeeAssets, &u.TreasuryShares, &u.ProviderShares,
			&u.EventTimestamp, &u.CreatedAt,
		)
		if err != nil {
			return nil, models.NewDatabaseError("scan", "accounting_updates", err)
		}
		updates = append(updates, u)
	}

	if err := rows.Err(); err != nil {
		return nil, models.NewDatabaseError("iterate", "accounting_updates", err)
	}

	return updates, nil
}
