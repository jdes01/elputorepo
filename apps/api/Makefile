.PHONY: help run save-event test install migrate migrate-new migrate-downgrade setup

# ------------------------
# Api Makefile
# ------------------------

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

run:  ## Ejecuta la app Typer con ARGS
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app $(ARGS)

save-event:  ## Guarda un evento con NAME
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app core save-event $(NAME)

test:  ## Ejecuta tests con pytest
	@PYTHONPATH=src .venv/bin/python3 -m pytest

install: ## Instala dependencias
	@uv sync --dev

setup: install migrate ## Instala dependencias y aplica migraciones

migrate: ## Aplica todas las migraciones pendientes
	@alembic upgrade head

migrate-new: ## Genera nueva migración con mensaje MESSAGE="nombre migración"
	@alembic revision --autogenerate -m "$(MESSAGE)"
	@alembic upgrade head

migrate-downgrade: ## Revierte migraciones VERSIONS=1
	@alembic downgrade -$(VERSIONS)

install-pre-commit: ## Instala pre-commit hooks
	@uv run pre-commit install --install-hooks