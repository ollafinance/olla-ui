package main

import (
	"context"
	"log"

	"github.com/ollafinance/ui/services/backend/internal/app"
	"github.com/ollafinance/ui/services/backend/internal/router"
	"github.com/ollafinance/ui/services/backend/internal/server"
)

func main() {
	ctx := context.Background()

	deps, err := app.Initialize(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	defer deps.Close()

	log.Printf("Loaded deployment for network: %s (chain ID: %d)", deps.Deployment.Network, deps.Deployment.ChainID)
	log.Printf("Loaded ABI from: %s", deps.ABIPath)

	go func() {
		log.Println("Starting indexer...")
		if err := deps.Indexer.Start(ctx); err != nil {
			log.Printf("Indexer error: %v", err)
		}
	}()

	engine := router.Setup(&router.RouterDeps{
		Store: deps.Store,
	})

	log.Printf("API documentation available at /docs")
	log.Printf("OpenAPI spec available at /openapi.json and /openapi.yaml")

	srv := server.NewServer(engine, deps.Config.Port)
	log.Printf("Starting server on port %s", deps.Config.Port)

	if err := srv.RunWithGracefulShutdown(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
