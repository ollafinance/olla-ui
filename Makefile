.PHONY: dev build lint clean migrate-up migrate-down types-generate install

dev:
	docker-compose up -d postgres
	yarn dev

build:
	yarn build

lint:
	yarn lint

clean:
	rm -rf services/frontend/dist
	rm -rf services/backend/bin

migrate-up:
	cd services/backend && make migrate-up

migrate-down:
	cd services/backend && make migrate-down

types-generate:
	yarn types:generate

install:
	yarn install
