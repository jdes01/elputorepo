FROM python:3.12-slim

ARG DEBUG
ENV DEBUG=${DEBUG:-0}

# Traemos uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Estructura dentro del contenedor:
# /app
# └── api
# /packages
# └── logger

WORKDIR /packages/logger
COPY packages/logger ./
RUN uv sync --editable


WORKDIR /app/api
ENV UV_CACHE_DIR=/tmp/uv-cache

COPY apps/api/pyproject.toml apps/api/uv.lock* ./
RUN uv sync --frozen --no-editable

COPY apps/api/src ./src
COPY apps/api/scripts ./scripts

EXPOSE 8000

CMD ["./scripts/run.sh"]
