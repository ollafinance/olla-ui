package models

import (
	"context"
	"time"
)

type Deposit struct {
	ID          int64     `json:"id"`
	TxHash      string    `json:"tx_hash"`
	BlockNumber int64     `json:"block_number"`
	LogIndex    int       `json:"log_index"`
	Caller      string    `json:"caller"`
	Recipient   string    `json:"recipient"`
	Assets      string    `json:"assets"` // String to handle large NUMERIC(78,0)
	Shares      string    `json:"shares"` // String to handle large NUMERIC(78,0)
	CreatedAt   time.Time `json:"created_at"`
}

type DepositList struct {
	Deposits []Deposit `json:"deposits"`
	Total    int64     `json:"total"`
}

type DepositStore interface {
	Insert(ctx context.Context, deposit *Deposit) error
	GetByRecipient(ctx context.Context, recipient string, limit, offset int) ([]Deposit, int64, error)
	GetByTxHash(ctx context.Context, txHash string) (*Deposit, error)
	GetLatestBlock(ctx context.Context) (int64, error)
}
