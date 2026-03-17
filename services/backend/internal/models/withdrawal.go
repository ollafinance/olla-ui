package models

import (
	"context"
	"time"
)

type EventType string

const (
	EventTypeWithdrawalRequested EventType = "withdrawal_requested"
	EventTypeWithdrawalClaimed   EventType = "withdrawal_claimed"
	EventTypeInstantRedemption   EventType = "instant_redemption"
	EventTypeRedeemRequest       EventType = "redeem_request"
)

type WithdrawalStatus string

const (
	StatusPending   WithdrawalStatus = "pending"
	StatusCompleted WithdrawalStatus = "completed"
)

type WithdrawalRequest struct {
	ID             int64            `json:"id"`
	RequestID      *int64           `json:"request_id"` // NULL for instant redemptions
	TxHash         string           `json:"tx_hash"`
	BlockNumber    int64            `json:"block_number"`
	LogIndex       int              `json:"log_index"`
	EventType      EventType        `json:"event_type"`
	Owner          string           `json:"owner"`
	Recipient      string           `json:"recipient"`
	Shares         string           `json:"shares"`          // NUMERIC(78,0)
	AssetsExpected string           `json:"assets_expected"` // NUMERIC(78,0)
	AssetsClaimed  string           `json:"assets_claimed"`  // NUMERIC(78,0)
	Fee            string           `json:"fee"`             // NUMERIC(78,0)
	GrossAssets    string           `json:"gross_assets"`    // NUMERIC(78,0)
	NetAssets      string           `json:"net_assets"`      // NUMERIC(78,0)
	ExchangeRate   string           `json:"exchange_rate"`   // NUMERIC(78,0)
	Status         WithdrawalStatus `json:"status"`
	CreatedAt      time.Time        `json:"created_at"`
	CompletedAt    *time.Time       `json:"completed_at"`
}

type WithdrawalList struct {
	Withdrawals []WithdrawalRequest `json:"withdrawals"`
	Total       int64               `json:"total"`
}

type WithdrawalStore interface {
	Insert(ctx context.Context, wr *WithdrawalRequest) error
	GetByRequestID(ctx context.Context, requestID int64) (*WithdrawalRequest, error)
	UpdateToCompleted(ctx context.Context, requestID int64, txHash string, assetsClaimed string, blockNumber int64, logIndex int) error
	GetByOwner(ctx context.Context, owner string, status *WithdrawalStatus, limit, offset int) ([]WithdrawalRequest, int64, error)
	GetByRecipient(ctx context.Context, recipient string, status *WithdrawalStatus, limit, offset int) ([]WithdrawalRequest, int64, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}
