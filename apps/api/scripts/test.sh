#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

source "$DIR/../.venv/bin/activate"

python3 -m pytest tests
