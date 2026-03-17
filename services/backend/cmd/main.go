package main

import (
	"github.com/gin-gonic/gin"
	_ "github.com/ollafinance/ui/services/backend/docs"
	"github.com/swaggo/gin-swagger"
	"github.com/swaggo/swag"
	"net/http"
)

// @title Olla Indexer API
// @version 1.0
// @description API for the Olla liquid staking indexer service
// @host localhost:8080
// @BasePath /api/v1
func main() {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swag.Handler))

	r.Run(":8080")
}
