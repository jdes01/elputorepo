# Guion de clase: de guarro a bien

Un capítulo por commit. Cada commit lleva su tag (`cap-00`, `cap-01`...), así
que para enseñar un capítulo:

```sh
git checkout cap-02
```

Requisitos en la máquina: docker con compose, git y [mise](https://mise.jdx.dev).

---

## Capítulo 0. La app funciona (y está mal)

**Tag:** `cap-00` · **Idea:** el código guarro no es el enemigo. Es el punto de
partida normal de casi cualquier proyecto real, y funciona.

### Qué enseñar

1. Arranca la app:
   ```sh
   pnpm install
   docker compose up -d
   pnpm dev
   ```
2. Abre http://localhost:5173. Crea un club, una pista y reserva. Cancela.
3. Abre `apps/padel/backend/src/app.controller.ts`. Es **toda** la app: 130
   líneas, 6 casos de uso.

### Qué discutir

- Pide a la clase que encuentre pecados antes de enseñar la tabla de `PLAN.md`.
  Suelen salir: todo en un fichero, SQL a pelo, `any`, `console.log`.
- Los que no suelen salir y hay que enseñar:
  - **SQL injection** en `POST /clubs`. Crea un club llamado `O'Donnell`: 500.
  - **La carrera**: el solape se comprueba con `SELECT` y luego `INSERT`. Dos
    peticiones a la vez pueden reservar la misma pista. No se ve probando a
    mano; esa es la gracia.
  - **Fechas como texto** en la zona horaria del servidor.
- Pregunta: _¿qué tendría que pasar para que te atrevieras a cambiar este
  fichero?_ Respuesta a la que llegar: necesito saber que no rompo nada. Antes
  de llegar ahí (capítulo 3), el capítulo 1 enseña qué pasa cuando se cambia
  sin esa red.
