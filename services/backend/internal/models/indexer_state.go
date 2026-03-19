package models

import (
	"context"
	"time"
)

type IndexerState struct {
	ID        int64     `json:"id"`
	Contract  string    `json:"contract"`
	LastBlock int64     `json:"last_block"`
	UpdatedAt time.Time `json:"updated_at"`
}

type IndexerStateStore interface {
	Get(ctx context.Context, contract string) (*IndexerState, error)
	Upsert(ctx context.Context, contract string, lastBlock int64) error
}
