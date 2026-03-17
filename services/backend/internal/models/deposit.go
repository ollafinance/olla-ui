package models

import (
	"context"
	"time"
)

// Deposit represents a deposit event from the blockchain
type Deposit struct {
	ID          int64     `json:"id" doc:"Unique deposit ID"`
	TxHash      string    `json:"tx_hash" doc:"Transaction hash on the blockchain"`
	BlockNumber int64     `json:"block_number" doc:"Block number when the deposit was made"`
	LogIndex    int       `json:"log_index" doc:"Log index within the block"`
	Caller      string    `json:"caller" doc:"Address that initiated the transaction"`
	Recipient   string    `json:"recipient" doc:"Address receiving the deposit shares"`
	Assets      string    `json:"assets" doc:"Amount of assets deposited (as string for large NUMERIC values)"`
	Shares      string    `json:"shares" doc:"Amount of shares minted (as string for large NUMERIC values)"`
	CreatedAt   time.Time `json:"created_at" doc:"Timestamp when the deposit was recorded"`
}

// DepositList represents a paginated list of deposits
type DepositList struct {
	Deposits []Deposit `json:"deposits" doc:"List of deposit records"`
	Total    int64     `json:"total" doc:"Total number of deposits matching the query"`
}

// DepositStore defines the interface for deposit data operations
type DepositStore interface {
	Insert(ctx context.Context, deposit *Deposit) error
	GetByRecipient(ctx context.Context, recipient string, limit, offset int) ([]Deposit, int64, error)
	GetByTxHash(ctx context.Context, txHash string) (*Deposit, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}
