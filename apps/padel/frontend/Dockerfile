# syntax=docker/dockerfile:1

# El contexto de build es la RAIZ del repo, no este directorio:
#   docker build -f apps/padel/frontend/Dockerfile .
#
# STAGES
#   base       node + pnpm.
#   manifests  solo el lockfile y los package.json.
#   builder    el workspace instalado y el bundle de vite (contracts entra como
#              fuente: vite lo compila).
#   prod       nginx sin root sirviendo el bundle estatico.

FROM node:26.12.0-alpine AS base
    RUN npm install -g pnpm@11.25.0
    WORKDIR /repo

FROM scratch AS manifests
    COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc /
    COPY apps/padel/contracts/package.json /apps/padel/contracts/
    COPY apps/padel/backend/package.json /apps/padel/backend/
    COPY apps/padel/frontend/package.json /apps/padel/frontend/

FROM base AS builder
    COPY --from=manifests / ./
    RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
        pnpm install --frozen-lockfile --store-dir /pnpm/store
    COPY Taskfile.yml ./
    COPY configs ./configs
    COPY apps/padel ./apps/padel
    RUN node_modules/.bin/task frontend:build

# La variante sin privilegios: corre como `nginx` y escucha en 8080.
FROM nginxinc/nginx-unprivileged:1.29-alpine AS prod
    COPY --from=builder /repo/apps/padel/frontend/dist /usr/share/nginx/html
    EXPOSE 8080
