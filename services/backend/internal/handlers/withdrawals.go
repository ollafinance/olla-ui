package handlers

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/models"
)

// WithdrawalsInput represents the input parameters for the withdrawals endpoint
type WithdrawalsInput struct {
	Address string `path:"address" maxLength:"42" example:"0x..." doc:"Owner address"`
	Status  string `query:"status" enum:"pending,completed" doc:"Filter by status"`
	Limit   int    `query:"limit" minimum:"1" maximum:"1000" default:"100" doc:"Maximum number of results to return"`
	Offset  int    `query:"offset" minimum:"0" default:"0" doc:"Number of results to skip"`
}

// WithdrawalsOutput represents the response from the withdrawals endpoint
type WithdrawalsOutput struct {
	Body models.WithdrawalList
}

// RegisterWithdrawals registers the withdrawals endpoints
func RegisterWithdrawals(api huma.API, store *database.Store) {
	// Get withdrawals by address (with optional status filter)
	huma.Register(api, huma.Operation{
		OperationID: "get-withdrawals",
		Method:      "GET",
		Path:        "/withdrawals/{address}",
		Summary:     "Get withdrawals by address",
		Description: "Returns all withdrawal requests for a given owner address",
		Tags:        []string{"withdrawals"},
	}, func(ctx context.Context, input *WithdrawalsInput) (*WithdrawalsOutput, error) {
		var status *models.WithdrawalStatus
		if input.Status != "" {
			s := models.WithdrawalStatus(input.Status)
			status = &s
		}

		withdrawals, total, err := store.Withdrawals.GetByOwner(ctx, input.Address, status, input.Limit, input.Offset)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to fetch withdrawals", err)
		}

		return &WithdrawalsOutput{
			Body: models.WithdrawalList{
				Withdrawals: withdrawals,
				Total:       total,
			},
		}, nil
	})

	// Get pending withdrawals by address
	huma.Register(api, huma.Operation{
		OperationID: "get-pending-withdrawals",
		Method:      "GET",
		Path:        "/withdrawals/{address}/pending",
		Summary:     "Get pending withdrawals by address",
		Description: "Returns all pending withdrawal requests for a given owner address",
		Tags:        []string{"withdrawals"},
	}, func(ctx context.Context, input *struct {
		Address string `path:"address" maxLength:"42" example:"0x..." doc:"Owner address"`
		Limit   int    `query:"limit" minimum:"1" maximum:"1000" default:"100" doc:"Maximum number of results to return"`
		Offset  int    `query:"offset" minimum:"0" default:"0" doc:"Number of results to skip"`
	}) (*WithdrawalsOutput, error) {
		status := models.StatusPending
		withdrawals, total, err := store.Withdrawals.GetByOwner(ctx, input.Address, &status, input.Limit, input.Offset)
		if err != nil {
			return nil, huma.Error500InternalServerError("Failed to fetch pending withdrawals", err)
		}

		return &WithdrawalsOutput{
			Body: models.WithdrawalList{
				Withdrawals: withdrawals,
				Total:       total,
			},
		}, nil
	})
}
