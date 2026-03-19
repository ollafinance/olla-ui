// Package router handles HTTP route registration and configuration.
//
// ARCHITECTURE NOTE: Services Layer
//
// When business logic grows beyond simple CRUD operations, add a services layer:
//
//	import "github.com/ollafinance/ui/services/backend/internal/services"
//
//	type RouterDeps struct {
//	    Store    *database.Store
//	    Services *services.Services  // Add when needed
//	}
//
// Example services to add:
//   - DepositService    - Complex deposit calculations, validation
//   - WithdrawalService - Withdrawal status transitions, business rules
//   - IndexerService    - Event processing orchestration
//
// Services would sit between handlers and stores:
//
//	Handler -> Service -> Store
//
// Benefits:
//   - Reusable business logic across different handlers
//   - Easier to test complex logic in isolation
//   - Clear separation: handlers handle HTTP, services handle business logic
package router

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/gin-gonic/gin"

	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/handlers"
)

type RouterDeps struct {
	Store *database.Store
}

func Setup(deps *RouterDeps) *gin.Engine {
	router := gin.Default()

	router.Use(corsMiddleware())

	api := setupAPI(router)
	registerRoutes(api, deps)

	return router
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func setupAPI(router *gin.Engine) huma.API {
	apiConfig := huma.DefaultConfig("Olla Indexer API", "1.0.0")
	apiConfig.OpenAPI.Info.Description = "API for the Olla liquid staking indexer service"
	apiConfig.Servers = []*huma.Server{
		{URL: "http://localhost:8080"},
	}
	return humagin.New(router, apiConfig)
}

func registerRoutes(api huma.API, deps *RouterDeps) {
	handlers.RegisterHealth(api)

	v1Group := huma.NewGroup(api, "/api/v1")
	handlers.RegisterDeposits(v1Group, deps.Store)
	handlers.RegisterWithdrawals(v1Group, deps.Store)
}
