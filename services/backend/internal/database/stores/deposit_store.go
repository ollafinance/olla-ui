package stores

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type DepositStore struct {
	db *pgxpool.Pool
}

func NewDepositStore(db *pgxpool.Pool) *DepositStore {
	return &DepositStore{db: db}
}

func (s *DepositStore) Insert(ctx context.Context, deposit *models.Deposit) error {
	query := `
		INSERT INTO deposits (tx_hash, block_number, log_index, caller, recipient, assets, shares)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (tx_hash) DO NOTHING
		RETURNING id, created_at
	`

	err := s.db.QueryRow(ctx, query,
		deposit.TxHash,
		deposit.BlockNumber,
		deposit.LogIndex,
		deposit.Caller,
		deposit.Recipient,
		deposit.Assets,
		deposit.Shares,
	).Scan(&deposit.ID, &deposit.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil
	}

	if err != nil {
		return models.NewDatabaseError("insert", "deposits", err)
	}

	return nil
}

func (s *DepositStore) GetByRecipient(ctx context.Context, recipient string, limit, offset int) ([]models.Deposit, int64, error) {
	query := `
		SELECT id, tx_hash, block_number, log_index, caller, recipient, assets, shares, created_at
		FROM deposits
		WHERE recipient = $1
		ORDER BY block_number DESC, log_index DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(ctx, query, recipient, limit, offset)
	if err != nil {
		return nil, 0, models.NewDatabaseError("query", "deposits", err)
	}
	defer rows.Close()

	var deposits []models.Deposit
	for rows.Next() {
		var d models.Deposit
		err := rows.Scan(&d.ID, &d.TxHash, &d.BlockNumber, &d.LogIndex, &d.Caller, &d.Recipient, &d.Assets, &d.Shares, &d.CreatedAt)
		if err != nil {
			return nil, 0, models.NewDatabaseError("scan", "deposits", err)
		}
		deposits = append(deposits, d)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, models.NewDatabaseError("iterate", "deposits", err)
	}

	countQuery := `SELECT COUNT(*) FROM deposits WHERE recipient = $1`
	var total int64
	err = s.db.QueryRow(ctx, countQuery, recipient).Scan(&total)
	if err != nil {
		return nil, 0, models.NewDatabaseError("count", "deposits", err)
	}

	return deposits, total, nil
}

func (s *DepositStore) GetByTxHash(ctx context.Context, txHash string) (*models.Deposit, error) {
	query := `
		SELECT id, tx_hash, block_number, log_index, caller, recipient, assets, shares, created_at
		FROM deposits
		WHERE tx_hash = $1
	`

	var d models.Deposit
	err := s.db.QueryRow(ctx, query, txHash).Scan(&d.ID, &d.TxHash, &d.BlockNumber, &d.LogIndex, &d.Caller, &d.Recipient, &d.Assets, &d.Shares, &d.CreatedAt)
	if err == pgx.ErrNoRows {
		return nil, models.NewNotFoundError("deposit", txHash)
	}
	if err != nil {
		return nil, models.NewDatabaseError("query", "deposits", err)
	}

	return &d, nil
}

func (s *DepositStore) GetLatestBlock(ctx context.Context) (int64, error) {
	query := `SELECT COALESCE(MAX(block_number), 0) FROM deposits`
	var latestBlock int64
	err := s.db.QueryRow(ctx, query).Scan(&latestBlock)
	if err != nil {
		return 0, models.NewDatabaseError("query", "deposits", err)
	}
	return latestBlock, nil
}
