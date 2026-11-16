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

---

## Capítulo 1. Así se metía un commit antes

**Tag:** `cap-01` · **Idea:** llega un requisito, mandar un correo de
confirmación al reservar, y se mete como se ha metido siempre: a mano, sin
tests, probando en local y mirando si llega. Funciona. Y aun así tiene
problemas que nadie va a ver hasta producción.

### Qué enseñar

1. El diff entero (`git show cap-01`): nodemailer, un Mailpit en el compose y
   17 líneas en el controlador. El mensaje del commit es "mandar correo al
   reservar". No dice por qué, ni cómo se probó, ni qué riesgos tiene.
2. Pruébalo como se probaba entonces:
   ```sh
   docker compose up -d
   pnpm dev
   ```
   Reserva en http://localhost:5173 y abre Mailpit en http://localhost:8025.
   Ahí está el correo. "Funciona".
3. El usuario ahora es su email (`X-User-Id: ana@padel.local`): a esa dirección
   va el correo.

### El momento clave: tres demos en vivo

- **Inyección de HTML.** Crea un club llamado `Club <b>Norte</b>` y reserva en
  él. En Mailpit, "Norte" sale en negrita: el nombre va al HTML sin escapar.
  Con un `<a href>` sale un enlace a donde quiera quien creó el club.
- **El SMTP se cae.**
  ```sh
  docker compose stop mailpit
  ```
  Reserva: **500**. El usuario cree que no ha reservado y reintenta: **409**,
  "la pista ya está reservada". La reserva se guardó antes de intentar el
  correo, así que la pista está ocupada por alguien que cree que no la tiene.
  ```sh
  docker compose start mailpit
  ```
- **¿Cómo se prueba esto sin abrir Mailpit?** No se puede. No hay tests, y
  aunque los hubiera, el controlador crea su propio transporte de correo con
  `localhost:1025` escrito a mano. No hay dónde enchufar otro servidor.

### Qué discutir

- **"Funciona" no es un criterio.** Todo lo de arriba funciona en la demo
  feliz. Los fallos están en los bordes: datos raros, servicios caídos,
  reintentos.
- **El mensaje del commit.** Dentro de seis meses, alguien hará
  `git blame` en esas líneas y leerá "mandar correo al reservar". Compáralo con
  los mensajes de los capítulos siguientes.
- **La petición espera al SMTP.** Si el servidor de correo tarda 5 segundos,
  reservar tarda 5 segundos.
- Todo esto está en la tabla de pecados de `PLAN.md`. Lo arreglan el e2e del
  capítulo 3 (probar el correo), la config del 5 (el servidor por env), y los
  eventos del 13 (sacar el correo de la reserva, y que un correo caído no
  tumbe la reserva).

---

## Capítulo 2. El harness

**Tag:** `cap-02` · **Idea:** antes de tocar el código, montar lo que hace que
todo el equipo (y los agentes de IA) trabajen igual: mismas versiones, mismas
comprobaciones, una sola puerta.

### Qué enseñar

1. Desde cero:
   ```sh
   make setup     # instala node 26 con mise, dependencias y git hooks
   make           # lista todo lo que se puede hacer
   make dev       # postgres, api y web
   ```
2. **mise** (`mise.toml`): la versión de node está en el repo, no en la máquina
   de cada uno.
3. **Catálogo de pnpm** (`pnpm-workspace.yaml`): una versión por dependencia
   compartida. Dos copias de react = "Invalid hook call" en runtime.
4. **La cadena** (cabecera de `Taskfile.yml`):
   ```
   Makefile  ─┐
   lefthook  ─┼─>  Taskfile.yml (raíz)  ──>  Taskfile de cada app
   (CI)      ─┘
   ```
   Makefile, hooks y CI llaman a lo mismo. "En mi máquina pasaba" deja de ser
   una explicación posible.
5. **lefthook** (`lefthook.yml`): haz un commit con un `==` y mira cómo lo para.
6. `configs/tsconfig.web.json`: lo importante es lo que **no** declara (los
   tipos de node). Una barrera puesta con configuración, no con disciplina.

### Qué discutir

- El lint encontró tres `==` en el código guarro y un import de nodemailer
  mal usado en el del capítulo 1. **Primer valor del harness: bugs gratis.**
- `no-console` está apagado en el backend con un comentario que lo
  explica (`configs/oxlintrc.json`). Deuda declarada y a la vista vs. un aviso
  que todo el mundo ignora.
- El typecheck `strict` pasa a la primera. ¿Buena noticia? No: el `any` lo tapa
  todo. Un harness verde no significa código sano.
