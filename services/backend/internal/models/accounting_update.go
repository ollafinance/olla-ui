package models

import (
	"context"
	"time"
)

// AccountingUpdate represents an AccountingUpdated event from the OllaCore contract.
// Stored as strings to safely represent NUMERIC(78,0) values from PostgreSQL.
type AccountingUpdate struct {
	ID                int64     `json:"id" doc:"Unique record ID"`
	Contract          string    `json:"contract" doc:"OllaCore contract address that emitted this event"`
	TxHash            string    `json:"tx_hash" doc:"Transaction hash"`
	BlockNumber       int64     `json:"block_number" doc:"Block number of this event"`
	LogIndex          int       `json:"log_index" doc:"Log index within the block"`
	TotalAssets       string    `json:"total_assets" doc:"Total assets under management (as string for large NUMERIC values)"`
	ExchangeRate      string    `json:"exchange_rate" doc:"stAztec/Aztec exchange rate (18 decimals, as string)"`
	GrossRewards      string    `json:"gross_rewards" doc:"Gross rewards in this period (as string)"`
	NetFlows          string    `json:"net_flows" doc:"Net asset flows — signed int256 stored as string"`
	ProtocolFeeAssets string    `json:"protocol_fee_assets" doc:"Protocol fee assets (as string)"`
	TreasuryShares    string    `json:"treasury_shares" doc:"Treasury shares minted (as string)"`
	ProviderShares    string    `json:"provider_shares" doc:"Provider shares minted (as string)"`
	EventTimestamp    int64     `json:"event_timestamp" doc:"Unix timestamp from the event itself"`
	CreatedAt         time.Time `json:"created_at" doc:"Timestamp when the record was indexed"`
}

// ApyResponse is returned by GET /api/v1/apy/{contract}.
type ApyResponse struct {
	// APY as a percentage string, e.g. "5.20". Empty string when not available.
	Apy string `json:"apy" doc:"APY as a percentage string, e.g. \"5.20\""`
	// Strategy used to compute the APY.
	// "multi_event"   – computed from two AccountingUpdated events (most accurate)
	// "single_report" – annualised from a single event against current time
	// "none"          – insufficient data; apy will be empty
	Strategy string `json:"strategy" doc:"Strategy used: multi_event | single_report | none"`
	// IsLive indicates whether the APY is derived from real indexed data.
	IsLive bool `json:"is_live" doc:"True when APY is derived from on-chain data"`
}

// AccountingUpdateStore defines the interface for accounting update data operations.
type AccountingUpdateStore interface {
	Insert(ctx context.Context, update *AccountingUpdate) error
	GetLatestN(ctx context.Context, contract string, n int) ([]AccountingUpdate, error)
}
