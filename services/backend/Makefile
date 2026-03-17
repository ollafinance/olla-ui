.PHONY: run build migrate-up migrate-down migrate-create swagger clean test

run:
	go run ./cmd/main.go

build:
	go build -o bin/server ./cmd/main.go

migrate-up:
	tern migrate --config tern.conf --migrations ./migrations

migrate-down:
	tern migrate --config tern.conf --migrations ./migrations --down

migrate-create:
	@read -p "Migration name: " name; \
	tern migrate --config tern.conf --migrations ./migrations create $$name

swagger:
	swag init -g cmd/main.go -o docs

clean:
	rm -rf bin/

test:
	go test -v ./...
