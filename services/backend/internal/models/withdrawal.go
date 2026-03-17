package models

import (
	"context"
	"time"
)

// EventType represents the type of withdrawal event
type EventType string

const (
	EventTypeWithdrawalRequested EventType = "withdrawal_requested"
	EventTypeWithdrawalClaimed   EventType = "withdrawal_claimed"
	EventTypeInstantRedemption   EventType = "instant_redemption"
	EventTypeRedeemRequest       EventType = "redeem_request"
)

// WithdrawalStatus represents the status of a withdrawal request
type WithdrawalStatus string

const (
	StatusPending   WithdrawalStatus = "pending"
	StatusCompleted WithdrawalStatus = "completed"
)

// WithdrawalRequest represents a withdrawal request from the blockchain
type WithdrawalRequest struct {
	ID             int64            `json:"id" doc:"Unique withdrawal ID"`
	RequestID      *int64           `json:"request_id" doc:"Request ID from the blockchain (optional)"`
	TxHash         string           `json:"tx_hash" doc:"Transaction hash on the blockchain"`
	BlockNumber    int64            `json:"block_number" doc:"Block number when the event occurred"`
	LogIndex       int              `json:"log_index" doc:"Log index within the block"`
	EventType      EventType        `json:"event_type" doc:"Type of withdrawal event"`
	Owner          string           `json:"owner" doc:"Address of the owner who requested withdrawal"`
	Recipient      string           `json:"recipient" doc:"Address receiving the assets"`
	Shares         *string          `json:"shares" doc:"Amount of shares to withdraw (optional)"`
	AssetsExpected *string          `json:"assets_expected" doc:"Expected assets to receive (optional)"`
	AssetsClaimed  *string          `json:"assets_claimed" doc:"Actual assets claimed (optional)"`
	Fee            *string          `json:"fee" doc:"Fee charged (optional)"`
	GrossAssets    *string          `json:"gross_assets" doc:"Gross assets before fees (optional)"`
	NetAssets      *string          `json:"net_assets" doc:"Net assets after fees (optional)"`
	ExchangeRate   *string          `json:"exchange_rate" doc:"Exchange rate at time of withdrawal (optional)"`
	Status         WithdrawalStatus `json:"status" doc:"Current status of the withdrawal"`
	CreatedAt      time.Time        `json:"created_at" doc:"Timestamp when the request was recorded"`
	CompletedAt    *time.Time       `json:"completed_at" doc:"Timestamp when the withdrawal was completed (optional)"`
}

// WithdrawalList represents a paginated list of withdrawals
type WithdrawalList struct {
	Withdrawals []WithdrawalRequest `json:"withdrawals" doc:"List of withdrawal records"`
	Total       int64               `json:"total" doc:"Total number of withdrawals matching the query"`
}

// WithdrawalStore defines the interface for withdrawal data operations
type WithdrawalStore interface {
	Insert(ctx context.Context, wr *WithdrawalRequest) error
	GetByRequestID(ctx context.Context, requestID int64) (*WithdrawalRequest, error)
	UpdateToCompleted(ctx context.Context, requestID int64, txHash string, assetsClaimed *string, blockNumber int64, logIndex int) error
	GetByOwner(ctx context.Context, owner string, status *WithdrawalStatus, limit, offset int) ([]WithdrawalRequest, int64, error)
	GetByRecipient(ctx context.Context, recipient string, status *WithdrawalStatus, limit, offset int) ([]WithdrawalRequest, int64, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}
