package handlers

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

// DepositsInput represents the input parameters for the deposits endpoint
type DepositsInput struct {
	Address string `path:"address" maxLength:"42" example:"0x..." doc:"Recipient address"`
	Limit   int    `query:"limit" minimum:"1" maximum:"1000" default:"100" doc:"Maximum number of results to return"`
	Offset  int    `query:"offset" minimum:"0" default:"0" doc:"Number of results to skip"`
}

// DepositsOutput represents the response from the deposits endpoint
type DepositsOutput struct {
	Body models.DepositList
}

// RegisterDeposits registers the deposits endpoints
func RegisterDeposits(api huma.API, store *database.Store) {
	huma.Register(api, huma.Operation{
		OperationID: "get-deposits",
		Method:      "GET",
		Path:        "/deposits/{address}",
		Summary:     "Get deposits by address",
		Description: "Returns all deposits for a given recipient address",
		Tags:        []string{"deposits"},
	}, func(ctx context.Context, input *DepositsInput) (*DepositsOutput, error) {
		deposits, total, err := store.Deposits.GetByRecipient(ctx, input.Address, input.Limit, input.Offset)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to fetch deposits", err)
		}

		return &DepositsOutput{
			Body: models.DepositList{
				Deposits: deposits,
				Total:    total,
			},
		}, nil
	})
}
