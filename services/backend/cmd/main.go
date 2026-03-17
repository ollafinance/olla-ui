package main

import (
	"context"
	"log"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/ollafinance/ui/services/backend/internal/config"
	"github.com/ollafinance/ui/services/backend/internal/database"
	"github.com/ollafinance/ui/services/backend/internal/handlers"
	"github.com/ollafinance/ui/services/backend/internal/indexer"
	"github.com/ollafinance/ui/services/backend/internal/server"
)

// @title Olla Indexer API
// @version 1.0
// @description API for the Olla liquid staking indexer service
// @host localhost:8080
// @BasePath /api/v1
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

	// Setup router
	router := setupRouter(store)

	// Create and start server
	srv := server.NewServer(router, cfg.Port)
	log.Printf("Starting server on port %s", cfg.Port)
	if err := srv.RunWithGracefulShutdown(); err != nil {
		log.Fatal("Server error:", err)
	}
}

func setupRouter(store *database.Store) *gin.Engine {
	router := gin.Default()

	// Health check
	router.GET("/health", handlers.Health)

	// Swagger docs
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Deposits
		depositsHandler := handlers.NewDepositsHandler(store)
		v1.GET("/deposits/:address", depositsHandler.GetDeposits)

		// Withdrawals
		withdrawalsHandler := handlers.NewWithdrawalsHandler(store)
		v1.GET("/withdrawals/:address", withdrawalsHandler.GetWithdrawals)
		v1.GET("/withdrawals/:address/pending", withdrawalsHandler.GetPendingWithdrawals)
	}

	return router
}
