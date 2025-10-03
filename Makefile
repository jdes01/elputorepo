.PHONY: up restart logs install test help

APPS     := $(notdir $(wildcard apps/*))
PACKAGES := $(notdir $(wildcard packages/*))

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Turn up app
	@echo "→ Starting docker compose..."
	@docker compose up --build -d

restart: ## Restart one or more services: make restart api worker
	@echo "→ Restarting docker compose service(s): $(filter-out $@,$(MAKECMDGOALS))"
	@docker compose up --build -d $(filter-out $@,$(MAKECMDGOALS))

logs: ## Show docker compose logs in real time
	@echo "→ Attaching to docker compose logs for service(s): $(filter-out $@,$(MAKECMDGOALS))"
	@docker compose logs -f --tail=100 $(filter-out $@,$(MAKECMDGOALS))

install: ## Install dependencies
	@for app in $(APPS); do \
		echo "→ Installing app: $$app"; \
		$(MAKE) -s -C apps/$$app install || true; \
	done; \
	for package in $(PACKAGES); do \
		echo "→ Installing package: $$package"; \
		$(MAKE) -s -C packages/$$package install || true; \
	done

test: ## Run tests
	@for app in $(APPS); do \
		echo "→ Testing app: $$app"; \
		$(MAKE) -s -C apps/$$app test || true; \
	done; \
	for package in $(PACKAGES); do \
		if [ -f packages/$$package/Makefile ]; then \
			if $(MAKE) -q -C packages/$$package test >/dev/null 2>&1; then \
				echo "→ Testing package: $$package"; \
				$(MAKE) -s -C packages/$$package test; \
			else \
				echo "→ Skipping package: $$package (no tests target)"; \
			fi \
		else \
			echo "→ Skipping package: $$package (no Makefile)"; \
		fi; \
	done


# Prevent make from treating args as targets
%:
	@:

