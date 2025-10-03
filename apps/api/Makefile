.PHONY: help run save-employee test

# ------------------------
# Api Makefile
# ------------------------

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

run:  ## Ejecuta la app Typer con ARGS
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app $(ARGS)

save-employee:  ## Guarda una employee con NAME
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app core save-employee $(NAME)

test:  ## Ejecuta tests con pytest
	@PYTHONPATH=src .venv/bin/python3 -m pytest

install: ## Install dependencies
	uv sync --dev