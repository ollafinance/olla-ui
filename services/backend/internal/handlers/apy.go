package handlers

import (
	"context"
	"fmt"
	"math"
	"math/big"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

const (
	secondsPerYear   = 365.25 * 24 * 3600
	minPeriodSeconds = 3600 // 1 hour minimum between two data points
	// 1e18 — exchange rate is stored as a fixed-point 18-decimal integer
	exchangeRateScale = 1e18
)

// ApyInput represents the input parameters for the APY endpoint.
type ApyInput struct {
	Contract string `path:"contract" maxLength:"42" example:"0x..." doc:"OllaCore contract address"`
}

// ApyOutput is the HTTP response wrapper for the APY endpoint.
type ApyOutput struct {
	Body models.ApyResponse
}

// RegisterApy registers GET /apy/{contract}.
func RegisterApy(api huma.API, store *database.Store) {
	huma.Register(api, huma.Operation{
		OperationID: "get-apy",
		Method:      "GET",
		Path:        "/apy/{contract}",
		Summary:     "Get protocol APY",
		Description: "Returns the annualised percentage yield for the given OllaCore contract, computed from indexed AccountingUpdated events.",
		Tags:        []string{"apy"},
	}, func(ctx context.Context, input *ApyInput) (*ApyOutput, error) {
		if !common.IsHexAddress(input.Contract) {
			return nil, huma.Error422UnprocessableEntity("Invalid contract address", fmt.Errorf("contract address %q is not a valid Ethereum address", input.Contract))
		}
		// Normalize to EIP-55 checksum format to match what the indexer stores.
		contract := common.HexToAddress(input.Contract).Hex()
		resp, err := computeApy(ctx, store, contract)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to compute APY", err)
		}
		return &ApyOutput{Body: *resp}, nil
	})
}

// computeApy fetches the latest AccountingUpdated records from the DB and
// computes APY using the following strategy cascade:
//
//  1. multi_event  — uses two events (earliest/latest of the last N records).
//     Requires elapsed ≥ minPeriodSeconds.
//  2. single_report — annualises a single event against the current wall clock.
//     Less accurate but better than nothing.
//  3. none         — insufficient data; returns empty APY.
func computeApy(ctx context.Context, store *database.Store, contract string) (*models.ApyResponse, error) {
	// Fetch the last 10 events (oldest-first after GetLatestN reorders).
	updates, err := store.AccountingUpdates.GetLatestN(ctx, contract, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch accounting updates: %w", err)
	}

	// --- Strategy 1: multi-event ---
	if len(updates) >= 2 {
		oldest := updates[0]
		newest := updates[len(updates)-1]

		elapsed := newest.EventTimestamp - oldest.EventTimestamp
		if elapsed >= minPeriodSeconds {
			rate0, err0 := parseExchangeRate(oldest.ExchangeRate)
			rate1, err1 := parseExchangeRate(newest.ExchangeRate)

			if err0 == nil && err1 == nil && rate0 > 0 && rate1 > 0 {
				rateRatio := rate1 / rate0
				apy := (math.Pow(rateRatio, secondsPerYear/float64(elapsed)) - 1) * 100
				if isValidApy(apy) {
					return &models.ApyResponse{
						Apy:      fmt.Sprintf("%.2f", apy),
						Strategy: "multi_event",
						IsLive:   true,
					}, nil
				}
			}
		}
	}

	// --- Strategy 2: single_report ---
	if len(updates) >= 1 {
		latest := updates[len(updates)-1]

		totalAssets, err0 := parseNumeric(latest.TotalAssets)
		grossRewards, err1 := parseNumeric(latest.GrossRewards)
		eventTimestamp := latest.EventTimestamp

		if err0 == nil && err1 == nil && totalAssets > 0 && grossRewards > 0 && eventTimestamp > 0 {
			now := time.Now().Unix()
			elapsed := now - eventTimestamp
			if elapsed >= 1 {
				preRewardAssets := totalAssets - grossRewards
				if preRewardAssets > 0 {
					periodYield := grossRewards / preRewardAssets
					apy := (math.Pow(1+periodYield, secondsPerYear/float64(elapsed)) - 1) * 100
					if isValidApy(apy) {
						return &models.ApyResponse{
							Apy:      fmt.Sprintf("%.2f", apy),
							Strategy: "single_report",
							IsLive:   true,
						}, nil
					}
				}
			}
		}
	}

	// --- No data / invalid ---
	return &models.ApyResponse{
		Apy:      "",
		Strategy: "none",
		IsLive:   false,
	}, nil
}

// parseExchangeRate converts an 18-decimal fixed-point integer string to float64.
// e.g. "1050000000000000000" → 1.05
func parseExchangeRate(s string) (float64, error) {
	n := new(big.Int)
	if _, ok := n.SetString(s, 10); !ok {
		return 0, fmt.Errorf("invalid exchange rate: %q", s)
	}
	f := new(big.Float).SetInt(n)
	scale := new(big.Float).SetFloat64(exchangeRateScale)
	f.Quo(f, scale)
	result, _ := f.Float64()
	return result, nil
}

// parseNumeric converts a plain integer string to float64 divided by 1e18
// (treating it as an 18-decimal value like totalAssets / grossRewards).
func parseNumeric(s string) (float64, error) {
	return parseExchangeRate(s)
}

func isValidApy(apy float64) bool {
	return apy > 0 && !math.IsInf(apy, 0) && !math.IsNaN(apy) && apy < 10000 // sanity cap at 10000%
}
