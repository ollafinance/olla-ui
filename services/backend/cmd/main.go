package main

import (
	"context"
	"log"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"
	"github.com/gin-gonic/gin"

	"github.com/ollafinance/ui/services/backend/internal/config"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/handlers"
	"github.com/ollafinance/ui/services/backend/internal/indexer"
	"github.com/ollafinance/ui/services/backend/internal/server"
)

func main() {
	ctx := context.Background()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Load deployment
	deployment, err := config.LoadDeployment(cfg.ContractsEnv)
	if err != nil {
		log.Fatal("Failed to load deployment:", err)
	}
	log.Printf("Loaded deployment for network: %s (chain ID: %d)", deployment.Network, deployment.ChainID)

	// Load ABI
	abi, abiPath, err := indexer.LoadABIFromRelativePath()
	if err != nil {
		log.Fatal("Failed to load ABI:", err)
	}
	log.Printf("Loaded ABI from: %s", abiPath)

	// Connect to database
	db, err := database.NewConnection(ctx, cfg.DatabaseURL())
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations
	if err := db.RunMigrations(ctx); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Create store
	store := database.NewStore(db.Pool)
	defer store.Close()

	// Create indexer
	idx, err := indexer.NewIndexer(cfg, deployment, store, abi)
	if err != nil {
		log.Fatal("Failed to create indexer:", err)
	}

	// Start indexer in background
	go func() {
		log.Println("Starting indexer...")
		if err := idx.Start(ctx); err != nil {
			log.Printf("Indexer error: %v", err)
		}
	}()

	// Setup router and Huma API
	router := setupRouter(store)

	// Log OpenAPI info
	log.Printf("API documentation available at /docs")
	log.Printf("OpenAPI spec available at /openapi.json and /openapi.yaml")

	// Create and start server
	srv := server.NewServer(router, cfg.Port)
	log.Printf("Starting server on port %s", cfg.Port)
	if err := srv.RunWithGracefulShutdown(); err != nil {
		log.Fatal("Server error:", err)
	}
}

func setupRouter(store *database.Store) *gin.Engine {
	router := gin.Default()

	// CORS middleware - allow all origins (handled by envoy gateway in k8s)
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Create main Huma API
	apiConfig := huma.DefaultConfig("Olla Indexer API", "1.0.0")
	apiConfig.OpenAPI.Info.Description = "API for the Olla liquid staking indexer service"
	apiConfig.Servers = []*huma.Server{
		{URL: "http://localhost:8080"},
	}
	api := humagin.New(router, apiConfig)

	// Register health at root level
	handlers.RegisterHealth(api)

	// Create API group for /api/v1 routes
	// This groups operations under /api/v1 while keeping them in the same OpenAPI spec
	v1Group := huma.NewGroup(api, "/api/v1")

	// Register deposits and withdrawals under the /api/v1 group
	handlers.RegisterDeposits(v1Group, store)
	handlers.RegisterWithdrawals(v1Group, store)

	return router
}
