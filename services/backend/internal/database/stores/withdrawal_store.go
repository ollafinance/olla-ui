package stores

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type WithdrawalStore struct {
	db *pgxpool.Pool
}

func NewWithdrawalStore(db *pgxpool.Pool) *WithdrawalStore {
	return &WithdrawalStore{db: db}
}

func (s *WithdrawalStore) Insert(ctx context.Context, wr *models.WithdrawalRequest) error {
	query := `
		INSERT INTO withdrawal_requests (
			contract, request_id, tx_hash, block_number, log_index, event_type,
			owner, recipient, shares, assets_expected, assets_claimed,
			fee, gross_assets, net_assets, exchange_rate, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
		ON CONFLICT (tx_hash, log_index) DO NOTHING
		RETURNING id, created_at
	`

	err := s.db.QueryRow(ctx, query,
		wr.Contract,
		wr.RequestID,
		wr.TxHash,
		wr.BlockNumber,
		wr.LogIndex,
		wr.EventType,
		wr.Owner,
		wr.Recipient,
		wr.Shares,
		wr.AssetsExpected,
		wr.AssetsClaimed,
		wr.Fee,
		wr.GrossAssets,
		wr.NetAssets,
		wr.ExchangeRate,
		wr.Status,
	).Scan(&wr.ID, &wr.CreatedAt)

	if err == pgx.ErrNoRows {
		return nil
	}

	if err != nil {
		return models.NewDatabaseError("insert", "withdrawal_requests", err)
	}

	return nil
}

func (s *WithdrawalStore) GetByRequestID(ctx context.Context, requestID int64) (*models.WithdrawalRequest, error) {
	query := `
		SELECT id, contract, request_id, tx_hash, block_number, log_index, event_type,
			owner, recipient, shares, assets_expected, assets_claimed,
			fee, gross_assets, net_assets, exchange_rate, status, created_at, completed_at
		FROM withdrawal_requests
		WHERE request_id = $1
		ORDER BY block_number DESC, log_index DESC
		LIMIT 1
	`

	var wr models.WithdrawalRequest
	err := s.db.QueryRow(ctx, query, requestID).Scan(
		&wr.ID, &wr.Contract, &wr.RequestID, &wr.TxHash, &wr.BlockNumber, &wr.LogIndex,
		&wr.EventType, &wr.Owner, &wr.Recipient, &wr.Shares, &wr.AssetsExpected,
		&wr.AssetsClaimed, &wr.Fee, &wr.GrossAssets, &wr.NetAssets, &wr.ExchangeRate,
		&wr.Status, &wr.CreatedAt, &wr.CompletedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, models.NewNotFoundError("withdrawal_request", fmt.Sprintf("%d", requestID))
	}
	if err != nil {
		return nil, models.NewDatabaseError("query", "withdrawal_requests", err)
	}

	return &wr, nil
}

func (s *WithdrawalStore) UpdateToCompleted(ctx context.Context, requestID int64, txHash string, assetsClaimed *string, blockNumber int64, logIndex int) error {
	query := `
		UPDATE withdrawal_requests
		SET 
			status = 'completed',
			assets_claimed = $1,
			completed_at = NOW()
		WHERE request_id = $2
	`

	result, err := s.db.Exec(ctx, query, assetsClaimed, requestID)
	if err != nil {
		return models.NewDatabaseError("update", "withdrawal_requests", err)
	}

	if result.RowsAffected() == 0 {
		return models.NewNotFoundError("withdrawal_request", fmt.Sprintf("%d", requestID))
	}

	return nil
}

func (s *WithdrawalStore) GetByOwner(ctx context.Context, owner string, status *models.WithdrawalStatus, limit, offset int) ([]models.WithdrawalRequest, int64, error) {
	baseQuery := `
		SELECT id, contract, request_id, tx_hash, block_number, log_index, event_type,
			owner, recipient, shares, assets_expected, assets_claimed,
			fee, gross_assets, net_assets, exchange_rate, status, created_at, completed_at
		FROM withdrawal_requests
		WHERE owner = $1
	`
	countBaseQuery := `SELECT COUNT(*) FROM withdrawal_requests WHERE owner = $1`

	args := []interface{}{owner}
	argIndex := 2

	if status != nil {
		baseQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		countBaseQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, string(*status))
		argIndex++
	}

	query := baseQuery + fmt.Sprintf(" ORDER BY block_number DESC, log_index DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, models.NewDatabaseError("query", "withdrawal_requests", err)
	}
	defer rows.Close()

	var withdrawals []models.WithdrawalRequest
	for rows.Next() {
		var wr models.WithdrawalRequest
		err := rows.Scan(
			&wr.ID, &wr.Contract, &wr.RequestID, &wr.TxHash, &wr.BlockNumber, &wr.LogIndex,
			&wr.EventType, &wr.Owner, &wr.Recipient, &wr.Shares, &wr.AssetsExpected,
			&wr.AssetsClaimed, &wr.Fee, &wr.GrossAssets, &wr.NetAssets, &wr.ExchangeRate,
			&wr.Status, &wr.CreatedAt, &wr.CompletedAt,
		)
		if err != nil {
			return nil, 0, models.NewDatabaseError("scan", "withdrawal_requests", err)
		}
		withdrawals = append(withdrawals, wr)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, models.NewDatabaseError("iterate", "withdrawal_requests", err)
	}

	var total int64
	if status != nil {
		err = s.db.QueryRow(ctx, countBaseQuery, owner, string(*status)).Scan(&total)
	} else {
		err = s.db.QueryRow(ctx, countBaseQuery, owner).Scan(&total)
	}
	if err != nil {
		return nil, 0, models.NewDatabaseError("count", "withdrawal_requests", err)
	}

	return withdrawals, total, nil
}

func (s *WithdrawalStore) GetByRecipient(ctx context.Context, recipient string, status *models.WithdrawalStatus, limit, offset int) ([]models.WithdrawalRequest, int64, error) {
	baseQuery := `
		SELECT id, contract, request_id, tx_hash, block_number, log_index, event_type,
			owner, recipient, shares, assets_expected, assets_claimed,
			fee, gross_assets, net_assets, exchange_rate, status, created_at, completed_at
		FROM withdrawal_requests
		WHERE recipient = $1
	`
	countBaseQuery := `SELECT COUNT(*) FROM withdrawal_requests WHERE recipient = $1`

	args := []interface{}{recipient}
	argIndex := 2

	if status != nil {
		baseQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		countBaseQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, string(*status))
		argIndex++
	}

	query := baseQuery + fmt.Sprintf(" ORDER BY block_number DESC, log_index DESC LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, models.NewDatabaseError("query", "withdrawal_requests", err)
	}
	defer rows.Close()

	var withdrawals []models.WithdrawalRequest
	for rows.Next() {
		var wr models.WithdrawalRequest
		err := rows.Scan(
			&wr.ID, &wr.Contract, &wr.RequestID, &wr.TxHash, &wr.BlockNumber, &wr.LogIndex,
			&wr.EventType, &wr.Owner, &wr.Recipient, &wr.Shares, &wr.AssetsExpected,
			&wr.AssetsClaimed, &wr.Fee, &wr.GrossAssets, &wr.NetAssets, &wr.ExchangeRate,
			&wr.Status, &wr.CreatedAt, &wr.CompletedAt,
		)
		if err != nil {
			return nil, 0, models.NewDatabaseError("scan", "withdrawal_requests", err)
		}
		withdrawals = append(withdrawals, wr)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, models.NewDatabaseError("iterate", "withdrawal_requests", err)
	}

	var total int64
	if status != nil {
		err = s.db.QueryRow(ctx, countBaseQuery, recipient, string(*status)).Scan(&total)
	} else {
		err = s.db.QueryRow(ctx, countBaseQuery, recipient).Scan(&total)
	}
	if err != nil {
		return nil, 0, models.NewDatabaseError("count", "withdrawal_requests", err)
	}

	return withdrawals, total, nil
}

func (s *WithdrawalStore) GetLatestBlock(ctx context.Context) (int64, error) {
	query := `SELECT COALESCE(MAX(block_number), 0) FROM withdrawal_requests`
	var latestBlock int64
	err := s.db.QueryRow(ctx, query).Scan(&latestBlock)
	if err != nil {
		return 0, models.NewDatabaseError("query", "withdrawal_requests", err)
	}
	return latestBlock, nil
}
