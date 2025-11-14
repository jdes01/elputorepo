#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

source "$DIR/../.venv/bin/activate"

# 🧠 Static type checking with mypy
mypy --config-file "$DIR/../mypy.ini" "$DIR/../src"
