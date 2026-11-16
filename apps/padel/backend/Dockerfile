# syntax=docker/dockerfile:1

# El contexto de build es la RAIZ del repo, no este directorio:
#   docker build -f apps/padel/backend/Dockerfile .
#
# STAGES
#   base       node + pnpm.
#   manifests  solo el lockfile y los package.json: un cambio en el codigo no
#              invalida las capas de la instalacion.
#   builder    todo el workspace instalado (con devDependencies) y compilado.
#   prod-deps  solo las dependencias de produccion del backend.
#   prod       prod-deps + lo compilado, sin root.

FROM node:26.12.0-alpine AS base
    RUN npm install -g pnpm@11.25.0
    WORKDIR /repo

FROM scratch AS manifests
    COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc /
    # Todos los package.json del workspace, no solo el del backend: con
    # --frozen-lockfile falta un importer del lockfile y aborta.
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
    RUN node_modules/.bin/task backend:build

# Los paquetes del workspace se quedan como ENLACES (nada de `pnpm deploy`, que
# los copia): contracts se consume como fuente .ts, y node no quita tipos de un
# .ts que cuelgue de node_modules.
FROM base AS prod-deps
    COPY --from=manifests / ./
    RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
        pnpm install --prod --frozen-lockfile --store-dir /pnpm/store \
          --filter "@padel/backend..."

FROM node:26.12.0-alpine AS prod
    ENV NODE_ENV=production
    WORKDIR /repo
    COPY --from=prod-deps /repo ./
    COPY --from=builder /repo/apps/padel/contracts/src ./apps/padel/contracts/src
    COPY --from=builder /repo/apps/padel/backend/dist ./apps/padel/backend/dist
    # Las migraciones van en la imagen: el servicio `migrate` del compose la
    # reutiliza con otro comando.
    COPY apps/padel/backend/migrations ./apps/padel/backend/migrations
    WORKDIR /repo/apps/padel/backend
    USER node
    EXPOSE 3000
    # La config (las URLs de la BD, el correo, Mongo y Redis, y PORT) viene del
    # compose que la ejecuta. La forma exec deja a node como PID 1: recibe el
    # SIGTERM de un `stop`.
    CMD ["node", "dist/src/main.js"]
