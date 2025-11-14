#!/bin/bash
set -e

# Obtiene la ruta absoluta del script
DIR="$(cd "$(dirname "$0")" && pwd)"

# Activa el venv de esta app
source "$DIR/../.venv/bin/activate"

# 🧹 Format code + sort imports (autofix with only I rule)
ruff format --config "$DIR/../ruff.toml" "$DIR/../src"
ruff check --config "$DIR/../ruff.toml" --select I --fix "$DIR/../src"
