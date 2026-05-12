package handlers

import (
	"context"

	"github.com/danielgtaylor/huma/v2"
)

// HealthOutput represents the health check response
type HealthOutput struct {
	Body struct {
		Status string `json:"status" example:"healthy" doc:"Service health status"`
	}
}

// RegisterHealth registers the health check endpoint
func RegisterHealth(api huma.API) {
	huma.Register(api, huma.Operation{
		OperationID: "health-check",
		Method:      "GET",
		Path:        "/health",
		Summary:     "Health check",
		Description: "Returns the health status of the service",
		Tags:        []string{"health"},
	}, func(ctx context.Context, input *struct{}) (*HealthOutput, error) {
		resp := &HealthOutput{}
		resp.Body.Status = "healthy"
		return resp, nil
	})
}
