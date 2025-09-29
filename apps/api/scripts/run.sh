#!/bin/bash

if [[ "$DEBUG" == "1" ]]; then
    echo "Running with debugpy..."
    uv run python -m debugpy --listen 0.0.0.0:5678 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug --no-access-log --use-colors
else
    echo "Running with uvicorn..."
    uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
fi
