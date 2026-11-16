# Pádel

Reservas de pistas de pádel: clubs con pistas y personas que las reservan.

Es el material de una clase de arquitectura de software. La app empieza mal
hecha a propósito y mejora commit a commit: `PLAN.md` es la hoja de ruta y
`GUION.md`, el guion de la clase.

## Arrancar

Requisitos: docker con compose, git y [mise](https://mise.jdx.dev).

```sh
make setup     # node, dependencias y git hooks
make dev       # postgres :5433, Mailpit :8025, api :3000, web :5173
make           # lista todo lo demás
```
