# `make` sin argumentos lista todo.
#
# Este Makefile SOLO tiene lo que envuelve docker o es la primera vez (setup).
# Todo lo que es codigo va por `task`, y estos targets lo llaman en una linea.

SHELL := /bin/bash
.DEFAULT_GOAL := help

# node y pnpm por mise: las versiones fijadas aunque el shell no tenga mise activado.
MISE := $(shell command -v mise 2>/dev/null || echo $(HOME)/.local/bin/mise)
TASK := $(MISE) exec -- node_modules/.bin/task
PSQL := docker compose exec postgres psql -U postgres padel

.PHONY: help setup up down logs psql reset migrate read-model dev lint format format\:check typecheck deps\:check build test test\:unit test\:http test\:integration test\:e2e

help: ## Esta lista
	@sed -nE 's/^([a-zA-Z_-]+(\\:[a-zA-Z_-]+)?):[^#]*## (.*)/\1\t\3/p' $(MAKEFILE_LIST) | sed 's/\\//' | awk -F'\t' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: ## Primera vez: node, dependencias y git hooks
	$(MISE) install
	$(MISE) exec -- pnpm install
	$(MISE) exec -- node_modules/.bin/lefthook install

up: ## Levanta postgres (idempotente)
	docker compose up -d --wait

down: ## Para postgres (conserva los datos)
	docker compose down

logs: ## Logs de postgres
	docker compose logs -f postgres

psql: ## Consola de la BD
	$(PSQL)

reset: ## Borra la BD, la levanta vacia y la migra
	docker compose down -v
	docker compose up -d --wait
	$(TASK) migrate

migrate: up ## Aplica las migraciones pendientes
	$(TASK) migrate

read-model: up ## Rehace el modelo de lectura de Mongo desde Postgres
	$(TASK) backend:read-model:rebuild

dev: migrate ## Postgres (migrado), backend y frontend en watch
	$(TASK) --output prefixed dev

lint: ## task lint
	$(TASK) lint

format: ## task format (ESCRIBE)
	$(TASK) format

format\:check: ## task format:check
	$(TASK) format:check

typecheck: ## task typecheck
	$(TASK) typecheck

deps\:check: ## task deps:check (las capas de cada modulo)
	$(TASK) deps:check

build: ## task build
	$(TASK) build

test: ## task test
	$(TASK) --output interleaved test

test\:unit: ## task test:unit
	$(TASK) --output interleaved test:unit

test\:http: ## task test:http (controllers, sin docker)
	$(TASK) --output interleaved test:http

test\:integration: ## task test:integration (necesita docker)
	$(TASK) --output interleaved test:integration

test\:e2e: ## task test:e2e (necesita docker)
	$(TASK) --output interleaved test:e2e
