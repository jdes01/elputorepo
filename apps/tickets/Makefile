.PHONY: help run test install format prisma-generate prisma-migrate migrate setup

# ------------------------
# Tickets Makefile
# ------------------------

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

run:  ## Ejecuta la app en modo desarrollo
	@sh scripts/run.sh

test:  ## Ejecuta tests
	@sh scripts/test.sh

install: ## Instala dependencias
	@npm ci

setup: install migrate ## Instala dependencias y aplica migraciones

format: ## Formatea el código
	@sh scripts/format.sh

migrate: ## Aplica migraciones de Prisma
	@echo "→ No hay migraciones que aplicar"


