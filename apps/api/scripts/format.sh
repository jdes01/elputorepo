#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

uv run ruff format --config "$DIR/../pyproject.toml" "$DIR/../src"
uv run ruff check --config "$DIR/../pyproject.toml" --select I --fix "$DIR/../src"
