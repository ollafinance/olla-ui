.PHONY: dev build lint clean migrate-up migrate-down swagger

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

swagger:
	cd services/backend && make swagger

install:
	yarn install
