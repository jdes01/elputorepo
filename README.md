# Pádel

Reservas de pistas de pádel: clubs con pistas y personas que las reservan.

Es el material de una clase de arquitectura de software. La app empieza mal
hecha a propósito y mejora commit a commit: `PLAN.md` es la hoja de ruta y
`GUION.md`, el guion de la clase.

## Arrancar

```sh
pnpm install
docker compose up -d      # postgres :5433, Mailpit :1025 (web en :8025)
pnpm dev                  # api :3000, web :5173
```
