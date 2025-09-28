.PHONY: help run save-pizza test

# ------------------------
# Makefile de apps/api
# ------------------------

help:  ## Muestra los comandos disponibles
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

run:  ## Ejecuta la app Typer con ARGS
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app $(ARGS)

save-pizza:  ## Guarda una pizza con NAME
	@PYTHONPATH=src .venv/bin/python3 -m apps.cli.app core save-pizza $(NAME)

test:  ## Ejecuta tests con pytest
	@PYTHONPATH=src .venv/bin/python3 -m pytest