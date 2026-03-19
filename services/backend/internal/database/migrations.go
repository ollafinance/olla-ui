package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/tern/v2/migrate"
)

func (db *DB) RunMigrations(ctx context.Context) error {
	conn, err := db.Pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("failed to acquire connection: %w", err)
	}
	defer conn.Release()

	migrator, err := migrate.NewMigrator(ctx, conn.Conn(), "schema_version")
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}

	if err := migrator.LoadMigrations(os.DirFS("migrations")); err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	if err := migrator.Migrate(ctx); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	version, err := migrator.GetCurrentVersion(ctx)
	if err != nil {
		return fmt.Errorf("failed to get current version: %w", err)
	}

	fmt.Printf("Database migrated to version %d\n", version)
	return nil
}
