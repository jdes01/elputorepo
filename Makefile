
.PHONY: up restart logs install test migrate help

include common/make/run-command-in-modules.mk

APPS     := $(notdir $(wildcard apps/*))
PACKAGES := $(notdir $(wildcard packages/*))

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Turn up app
	@echo "→ Starting docker compose..."
	@docker compose up --build -d

down: ## Turn down app
	@echo "→ Stopping docker compose..."
	@docker compose down

restart: ## Restart one or more services: make restart api worker
	@echo "→ Restarting docker compose service(s): $(filter-out $@,$(MAKECMDGOALS))"
	@docker compose up --build -d $(filter-out $@,$(MAKECMDGOALS))

logs: ## Show docker compose logs in real time
	@echo "→ Attaching to docker compose logs for service(s): $(filter-out $@,$(MAKECMDGOALS))"
	@docker compose logs -f --tail=100 $(filter-out $@,$(MAKECMDGOALS))

install: ## Install dependencies
	@echo "→ Running install in root"
	@uv sync --dev

	$(call run-command-in-modules,install,$(APPS),apps)
	$(call run-command-in-modules,install,$(PACKAGES),packages)

migrate: ## Run migrations for all apps
	$(call run-command-in-modules,migrate,$(APPS),apps)

test: ## Run tests
	$(call run-command-in-modules,test,$(APPS),apps)
	$(call run-command-in-modules,test,$(PACKAGES),packages)

setup: ## Run setups
	$(call run-command-in-modules,setup,$(APPS),apps)
	$(call run-command-in-modules,setup,$(PACKAGES),packages)

install-pre-commit:
	@uv run pre-commit install --install-hooks

	$(call run-command-in-modules,install-pre-commit,$(APPS),apps)
	$(call run-command-in-modules,install-pre-commit,$(PACKAGES),packages)

# Prevent make from treating args as targets
%:
	@:
