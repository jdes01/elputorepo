#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

source "$DIR/../.venv/bin/activate"

# 🔍 Run Ruff in lint mode (no auto-fix)
ruff check --config "$DIR/../ruff.toml" --fix "$DIR/../src"
