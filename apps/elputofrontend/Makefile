.PHONY: help install run build test setup install-pre-commit

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Instala dependencias del frontend
	@echo "→ Instalando dependencias NPM..."
	@npm install

run: ## Ejecuta el servidor de desarrollo (Vite)
	@echo "→ Ejecutando Vite dev server..."
	@npm run dev -- --open

build: ## Construye la aplicación para producción
	@echo "→ Construyendo build de producción..."
	@npm run build

test: ## Ejecuta los tests del frontend (Vitest)
	@echo "→ Ejecutando tests..."
	@npm run test

setup: install ## Instala dependencias (y más si quisieras)

install-pre-commit: ## Instala los hooks de pre-commit si los hubiera
	@echo "→ No hay hooks locales para frontend. Nada que hacer."
