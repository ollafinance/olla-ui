package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	// Database
	PostgresHost     string
	PostgresPort     string
	PostgresDBName   string
	PostgresUser     string
	PostgresPassword string
	PostgresSSL      string

	// Ethereum
	RPCURL string

	// Contracts
	ContractsEnv string

	// Indexer
	PollInterval time.Duration
	StartBlock   int64

	// Server
	Port     string
	LogLevel string
}

func Load() (*Config, error) {
	if os.Getenv("ENVIRONMENT") != "production" {
		if err := godotenv.Load(); err != nil {
			fmt.Println("No .env file found, using environment variables")
		}
	}

	pollIntervalStr := getEnv("POLL_INTERVAL", "10s")
	pollInterval, err := time.ParseDuration(pollIntervalStr)
	if err != nil {
		return nil, fmt.Errorf("invalid POLL_INTERVAL: %w", err)
	}

	config := &Config{
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresDBName:   getEnv("POSTGRES_DB_NAME", "olla_indexer_testnet"),
		PostgresUser:     getEnv("POSTGRES_USER", "admin"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", ""),
		PostgresSSL:      getEnv("POSTGRES_SSL_ENABLED", "disable"),
		RPCURL:           getEnv("RPC_URL", ""),
		ContractsEnv:     getEnv("CONTRACTS_ENV", "local"),
		PollInterval:     pollInterval,
		StartBlock:       getEnvInt64("START_BLOCK", -1),
		Port:             getEnv("PORT", "8080"),
		LogLevel:         getEnv("LOG_LEVEL", "info"),
	}

	if config.PostgresPassword == "" {
		return nil, fmt.Errorf("POSTGRES_PASSWORD is required")
	}

	if config.RPCURL == "" {
		return nil, fmt.Errorf("RPC_URL is required")
	}

	return config, nil
}

func (c *Config) DatabaseURL() string {
	sslMode := "disable"
	if c.PostgresSSL == "require" || c.PostgresSSL == "true" {
		sslMode = "require"
	}

	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.PostgresUser,
		c.PostgresPassword,
		c.PostgresHost,
		c.PostgresPort,
		c.PostgresDBName,
		sslMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}
