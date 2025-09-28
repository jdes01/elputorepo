FROM python:3.12-slim

ARG DEBUG
ENV DEBUG=${DEBUG:-0}

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

ENV UV_CACHE_DIR=/tmp/uv-cache

COPY pyproject.toml uv.lock* ./

RUN uv sync --frozen

COPY src/ ./src/

COPY scripts/ ./scripts/

EXPOSE 8000

CMD ["./scripts/run.sh"]
