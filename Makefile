.PHONY: dev build down logs migrate makemigrations createsuperuser shell reset-db generate-schema

dev:
	docker compose up

build:
	docker compose build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose run --rm backend python manage.py migrate

makemigrations:
	docker compose run --rm backend python manage.py makemigrations

createsuperuser:
	docker compose run --rm backend python manage.py createsuperuser

shell:
	docker compose run --rm backend python manage.py shell

reset-db:
	docker compose down -v
	docker compose run --rm backend python manage.py migrate

generate-schema:
	docker compose run --rm backend python manage.py spectacular --file openapi.json
	cp backend/openapi.json frontend/openapi.json
