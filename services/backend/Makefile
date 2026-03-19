.PHONY: run build migrate-up migrate-down migrate-create clean test

run:
	go run ./cmd/main.go

build:
	go build -o bin/server ./cmd/main.go

migrate-up:
	@if [ ! -f .env ]; then echo "Error: .env file not found"; exit 1; fi
	@set -a && . ./.env && set +a && tern migrate \
		--host "$${POSTGRES_HOST}" \
		--port "$${POSTGRES_PORT}" \
		--database "$${POSTGRES_DB_NAME}" \
		--user "$${POSTGRES_USER}" \
		--password "$${POSTGRES_PASSWORD}" \
		--sslmode "$${POSTGRES_SSL_ENABLED:-disable}" \
		--migrations ./migrations

migrate-down:
	@if [ ! -f .env ]; then echo "Error: .env file not found"; exit 1; fi
	@set -a && . ./.env && set +a && tern migrate \
		--destination -1 \
		--host "$${POSTGRES_HOST}" \
		--port "$${POSTGRES_PORT}" \
		--database "$${POSTGRES_DB_NAME}" \
		--user "$${POSTGRES_USER}" \
		--password "$${POSTGRES_PASSWORD}" \
		--sslmode "$${POSTGRES_SSL_ENABLED:-disable}" \
		--migrations ./migrations

migrate-create:
	@read -p "Migration name: " name; \
	tern migrate --config tern.conf --migrations ./migrations create $$name

clean:
	rm -rf bin/

test:
	go test -v ./...
