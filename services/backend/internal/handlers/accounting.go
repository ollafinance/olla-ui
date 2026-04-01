package handlers

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

type AccountingInput struct {
	Contract string `path:"contract" maxLength:"42" example:"0x..." doc:"OllaCore contract address"`
	Limit    int    `query:"limit"  minimum:"1" maximum:"5000" default:"5000"`
	Offset   int    `query:"offset" minimum:"0" default:"0"`
}

type AccountingOutput struct {
	Body models.AccountingUpdateList
}

// RegisterAccounting registers GET /accounting/{contract}.
// Returns the full indexed AccountingUpdated event history for a contract,
// ordered by block_number ascending. Used by the frontend to interpolate the
// exchange rate at the time of each user deposit for precise rewards calculation.
func RegisterAccounting(api huma.API, store *database.Store) {
	huma.Register(api, huma.Operation{
		OperationID: "get-accounting",
		Method:      "GET",
		Path:        "/accounting/{contract}",
		Summary:     "Get accounting update history",
		Description: "Returns all indexed AccountingUpdated events for the given OllaCore contract, ordered by block_number ascending. Used to interpolate exchange rates at deposit time for per-user rewards calculation.",
		Tags:        []string{"accounting"},
	}, func(ctx context.Context, input *AccountingInput) (*AccountingOutput, error) {
		if !common.IsHexAddress(input.Contract) {
			return nil, huma.Error422UnprocessableEntity("Invalid contract address", nil)
		}

		contract := common.HexToAddress(input.Contract).Hex()

		updates, total, err := store.AccountingUpdates.GetByContract(ctx, contract, input.Limit, input.Offset)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to fetch accounting updates", err)
		}

		if updates == nil {
			updates = []models.AccountingUpdate{}
		}

		return &AccountingOutput{
			Body: models.AccountingUpdateList{
				Updates: updates,
				Total:   total,
			},
		}, nil
	})
}
