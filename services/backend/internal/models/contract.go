package models

import (
	"context"
	"time"
)

type Contract struct {
	ID              int       `json:"id" doc:"Unique contract ID"`
	Address         string    `json:"address" doc:"Contract address on the blockchain"`
	Version         int       `json:"version" doc:"Contract version number"`
	DeployedAtBlock *int64    `json:"deployed_at_block" doc:"Block number when contract was deployed (optional)"`
	FirstIndexedAt  time.Time `json:"first_indexed_at" doc:"Timestamp when contract was first indexed"`
	Notes           *string   `json:"notes" doc:"Additional notes (optional)"`
}

type ContractStore interface {
	Upsert(ctx context.Context, address string, deployedAtBlock *int64) error
	GetByVersion(ctx context.Context, version int) (*Contract, error)
	GetLatestVersion(ctx context.Context) (int, error)
}
