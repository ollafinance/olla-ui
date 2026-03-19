package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

type Server struct {
	httpServer *http.Server
}

func NewServer(router *gin.Engine, port string) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:              ":" + port,
			Handler:           router,
			ReadTimeout:       30 * time.Second,
			WriteTimeout:      30 * time.Second,
			IdleTimeout:       60 * time.Second,
			ReadHeaderTimeout: 10 * time.Second,
		},
	}
}

func (s *Server) Start() error {
	log.Printf("Starting server on port %s", s.httpServer.Addr[1:])
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("Shutting down server...")
	return s.httpServer.Shutdown(ctx)
}

// RunWithGracefulShutdown starts the server and handles graceful shutdown.
// Returns an error if the server fails to start or shutdown.
func (s *Server) RunWithGracefulShutdown() error {
	// Channel to capture server errors
	serverErr := make(chan error, 1)

	go func() {
		if err := s.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- fmt.Errorf("failed to start server: %w", err)
		}
	}()

	// Wait for interrupt signal or server error
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		return err
	case <-quit:
		// Graceful shutdown initiated
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := s.Shutdown(ctx); err != nil {
		return fmt.Errorf("server forced to shutdown: %w", err)
	}

	log.Println("Server exited")
	return nil
}
