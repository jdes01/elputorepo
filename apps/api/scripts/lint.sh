#!/bin/bash
set -e  # Salir si hay un error

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR/.."

uv run ruff check --config "pyproject.toml" --fix "src" "tests"