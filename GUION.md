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

---

## Capítulo 3. Una red antes de tocar nada: e2e

**Tag:** `cap-03` · **Idea:** para refactorizar hace falta una red de
seguridad. Con todo pegado en un controlador, la única superficie que se puede
testear sin atarse a la implementación es la de fuera: HTTP.

### Qué enseñar

1. Lanza los tests (necesita docker):
   ```sh
   make test:e2e
   ```
   20 tests en 4 ficheros. ~8 s en total: compilar, levantar un postgres y un
   Mailpit en docker, arrancar la app y ~1 s de tests de verdad.
2. `apps/padel/backend/e2e/global-setup.ts`: caja negra de verdad. Un postgres
   y un Mailpit de usar y tirar (testcontainers) y la app **compilada** como
   proceso aparte. Los tests solo hablan HTTP. El Mailpit se da por listo
   cuando responde su `/readyz`: un servicio puede aceptar conexiones antes de
   estar listo, y esperar solo al puerto da fallos de vez en cuando.
3. Uno de los tests, por ejemplo `book.e2e.test.ts`. Un caso de uso por fichero,
   un test por regla. Ahí está `manda un correo de confirmacion a quien
reserva`: lee la API de Mailpit (`mailsTo` en `e2e/api.ts`). Lo que en el
   capítulo 1 era abrir una web y mirar, ahora es un test.
4. La **costura**: para poder testear hubo que tocar el código de producción en
   tres líneas, `DATABASE_URL`, `SMTP_URL` y `PORT` leídos de env
   (`app.controller.ts`, `main.ts`). Es lo mínimo para meter el test sin cambiar
   comportamiento. Es la respuesta a la pregunta del capítulo 1: _¿dónde
   enchufo otro servidor de correo?_
5. Demuestra que la red funciona: rompe una regla y lanza los tests.
   ```sh
   # en app.controller.ts, cambia `if (hours < 24)` por `if (hours < 0)`
   make test:e2e      # falla "no deja cancelar con menos de 24 h"
   ```
   Anécdota de cuando se preparó esto: al anular la regla de solapes con un
   `if (false)`, ni llegaron a correr los tests. El build falló porque la
   variable del bucle quedaba sin usar (`noUnusedLocals`). El harness del
   capítulo 2 pilló la rotura antes que la red del 3.

### Qué discutir

- **Tests que fijan pecados.** `revienta con 500 si falta la hora de inicio` y
  `revienta con 500 si el nombre lleva comilla simple` testean comportamiento
  **malo**, y su nombre lo dice. Fijan lo que hay hoy para que el refactor
  no lo cambie sin querer. El capítulo que lo arregle cambiará el
  test a propósito. Pregunta: _¿por qué no arreglarlo ya?_ Porque un commit que
  añade tests y cambia comportamiento a la vez no deja ver qué rompió qué.
- **La pirámide está invertida**, y es lo correcto hoy. Un unitario ahora
  obligaría a mockear `db.query`: un test atado a la implementación que muere
  justo en el refactor que debía proteger.
- Apunta en la pizarra: **20 e2e, 0 unitarios, 0 integración, ~8 s.** Se
  vuelve a apuntar al final de cada capítulo.
- Lo que estos tests **no** pillan: la carrera, y la reserva a medias cuando el
  SMTP se cae. Un test secuencial con todo levantado no ve ninguna de las dos.
  La reserva a medias se arregla en el capítulo 13, y la carrera en el 14.

---

## Capítulo 4. Contratos y validación en la frontera

**Tag:** `cap-04` · **Idea:** lo que entra por HTTP es input no fiable. Se
valida **una vez**, en la frontera, contra un contrato que comparten el front y
el back. A partir de ahí el código puede fiarse de la forma de los datos.

### Qué enseñar

1. El paquete nuevo `apps/padel/contracts`. Cada operación es un objeto con
   método, ruta, `params`, `query`, `body` y `response` en zod
   (`bookings.operations.ts`). Sin dominio y sin framework: solo formas.
2. Se consume **como fuente**, sin build: vite lo compila en el front y node lo
   ejecuta tal cual (type stripping) en el backend. Por eso importa con `.ts`.
3. `apps/padel/backend/src/zod.pipe.ts`: la frontera entera son 10 líneas. Lo
   que no cumple el contrato es un 400 con un mensaje legible. Pruébalo:
   ```sh
   make dev
   curl -XPOST localhost:3000/clubs -H 'content-type: application/json' -d '{"name":""}'
   ```
4. El controlador ya no tiene `any`: los tipos salen del contrato. El front
   tampoco (`App.tsx` importa `Club`, `Court`, `Slot`...).
5. La SQL injection de `POST /clubs` se arregla con una consulta parametrizada.
   Una línea.
6. La cabecera `X-User-Id` también es entrada. Sin ella, cancelar y ver "mis
   reservas" responden 401, igual que reservar. Antes, cancelar daba 403 y
   "mis reservas" devolvía una lista vacía.

### El momento clave: los tests

Lanza los tests del capítulo 3 contra el código del 4:

```sh
git checkout cap-04
git checkout cap-03 -- 'apps/padel/backend/e2e/*.e2e.test.ts'   # los tests de antes
make test:e2e
git checkout cap-04 -- apps/padel/backend/e2e                    # deja todo como estaba
```

```
× revienta con 500 si el nombre lleva comilla simple   expected 201 to be 500
× revienta con 500 si falta la hora de inicio          expected 400 to be 500
Tests  2 failed | 18 passed (20)
```

Fallan **exactamente** los dos tests que fijaban pecados, y los otros 18 siguen
en verde. Eso demuestra que el cambio hizo lo que tenía que hacer y nada más.
Después se cambian esos dos tests a propósito y se añaden 5 de validación y 2 de la
cabecera `X-User-Id`.

### Qué discutir

- **Forma vs. regla.** `opens: "9"` es un error de forma (400, contrato). Que
  la pista abra antes de cerrar es una **regla de negocio**: no va en el
  contrato, va en el dominio (capítulo 7). Pregunta a la clase dónde pondrían
  "no se reserva en el pasado". Respuesta: tampoco en el contrato, porque
  depende del reloj, no de la forma.
- **Los tipos destapan bugs.** En cuanto `body.start` dejó de ser `any`, el
  compilador marcó que `split(':')[0]` puede ser `undefined`. Como el contrato
  garantiza `HH:MM`, ahora se lee por posición. Validar en la frontera
  simplifica el código de dentro.
- **El contrato documenta lo que hay, no lo que nos gustaría.** Las respuestas
  son las filas de la tabla (`club_id` en snake_case). Es otro pecado de la
  tabla de `PLAN.md`, y salió al escribir el contrato, igual que el 500 de la
  disponibilidad de una pista que no existe. Pasa a menudo: hacer explícito lo
  implícito destapa cosas.
- **Por qué SWC.** tsc se negaba a compilar el backend: el contrato es fuente
  de otro paquete y queda fuera de su `rootDir`. SWC compila fichero a fichero
  y el typecheck va aparte (`make typecheck`). Separar "compilar" de
  "comprobar tipos" es un patrón que se repite en todo el ecosistema.
- Pizarra: **27 e2e, 0 unitarios, 0 integración, ~9 s.** Todavía no ha
  aparecido ninguna capa nueva: la validación solo se puede probar desde fuera.

---

## Capítulo 5. Config tipada y migraciones

**Tag:** `cap-05` · **Idea:** el schema de la BD y la configuración son parte
del código. Se versionan, se validan y fallan pronto y con un mensaje claro.

### Qué enseñar

1. **Config** (`apps/padel/backend/src/config.ts`). Es el único sitio que lee
   `process.env` y lo valida con zod al arrancar. Pruébalo sin la variable:
   ```sh
   cd apps/padel/backend && node dist/src/main.js
   # Error: Configuracion invalida:
   # ✖ Invalid input: expected string, received undefined
   #   → at DATABASE_URL
   # ✖ Invalid input: expected string, received undefined
   #   → at SMTP_URL
   ```
   Antes se conectaba a una URL inventada y fallaba en la primera petición. El
   servidor de correo, igual: `SMTP_URL` entra en la config validada.
2. **Schema** (`src/schema.ts`): la fuente de verdad, en TypeScript. Las
   migraciones salen de ahí:
   ```sh
   task backend:migration:generate -- --name lo-que-sea
   ```
   Enseña `migrations/0000_init.sql`. Es SQL legible y se revisa en el PR como
   cualquier otro código.
3. **Aplicarlas es un paso aparte**, no algo que la app hace al arrancar:
   ```sh
   make migrate     # también lo hace `make dev` antes de levantar nada
   ```
   La app asume que la BD está al día. Los e2e aplican las **mismas**
   migraciones al contenedor (`e2e/global-setup.ts`).
4. **Constraints**: FKs, `NOT NULL` y un `CHECK (opens < closes)`. Son la
   última línea de defensa: aunque el código se equivoque, la BD no guarda
   basura.

### El momento clave: verde no significa igual

Los 27 e2e pasan sin tocar ninguno. Pero el comportamiento **sí** ha cambiado,
y justo donde no miraba ningún test:

| Petición                        | Capítulo 4              | Capítulo 5              |
| ------------------------------- | ----------------------- | ----------------------- |
| Pista que cierra antes de abrir | 201, la guarda tal cual | 500, la para el `CHECK` |
| Pista en un club que no existe  | 201, pista huérfana     | 500, la para la FK      |

Se añaden dos e2e que fijan el comportamiento nuevo (su nombre empieza por
`revienta con 500`). Los capítulos 7 y 8 los convertirán en 400 y 404. Pregunta a la clase: _¿es mejor o peor
que antes?_ Mejor: un 500 es un error que se ve; una pista huérfana es
corrupción silenciosa que aparece meses después.

### Qué discutir

- **Migrar al arrancar vs. paso aparte.** Con varias réplicas arrancando a la
  vez, todas intentarían migrar. Y un rollback de la app no deshace el schema.
  Separarlo obliga a pensar en migraciones compatibles hacia atrás (eso sale en
  el capítulo de CI/CD).
- **La primera migración choca con la BD de antes.** Las tablas ya existían
  (las creó el `CREATE TABLE` del capítulo 0) y `make migrate` falla. Encima
  drizzle-kit **no dice por qué**. Solución: `make reset`. En producción no
  hay reset: se "adopta" el schema existente marcando la migración inicial
  como aplicada. Buen ejemplo de por qué las migraciones conviene tenerlas
  desde el día 1.
- **Config: lo que cambia entre entornos vs. lo que no.** `DATABASE_URL` y
  `SMTP_URL` cambian y vienen de env. En local están como literales en el
  Taskfile del backend, porque no son secretos reales.
- **Lo que este capítulo no hace:** las consultas siguen siendo SQL a pelo y
  las fechas siguen siendo texto. Usar drizzle para leer y escribir llega con
  los repositorios (capítulo 9); los tipos de fecha llegan con los value objects
  (capítulo 7).
- Pizarra: **29 e2e, 0 unitarios, 0 integración, ~5 s** (con el build en caché;
  ~8 s si hay que compilar). Casi todo es contenedor y arranque de la app.

---

## Capítulo 6. MVC: parece bien hecho

**Tag:** `cap-06` · **Idea:** ordenar el código en capas es el primer paso
que da casi todo el mundo, y está bien darlo. Pero un MVC "de manual" esconde
errores que solo se ven cuando la app crece. Este capítulo los comete **a
propósito**; los siguientes los desmontan uno a uno.

### Qué enseñar

1. La estructura nueva de `apps/padel/backend/src`:
   ```
   clubs/      club.model.ts     clubs.controller.ts     clubs.service.ts
   bookings/   booking.model.ts  bookings.controller.ts  bookings.service.ts
   database.module.ts   (el Pool, inyectado en los services)
   mail.module.ts       (el Mailer, inyectado igual)
   ```
   - **Modelo**: la forma de los datos (`booking.model.ts`).
   - **Controller**: recibe HTTP, valida con el contrato y delega.
   - **Service**: la lógica y el SQL, directo.
   - **Vista**: en una API, el JSON que devuelve el controller.
2. El controller ya no sabe nada de SQL ni de reglas: 40 líneas de rutas.
3. **Refactor puro**: los 29 e2e pasan sin cambiar ni una línea de test.
   ```sh
   make test:e2e
   git diff cap-05 cap-06 --stat -- apps/padel/backend/e2e   # vacío
   ```
   Sin la red del capítulo 3, este movimiento habría sido un acto de fe. El
   correo incluido: el test que lo comprueba sigue en verde.

### El momento clave: "¿esto está bien?"

Antes de enseñar los problemas, pregunta a la clase si este código está bien.
Tiene carpetas, capas, inyección de dependencias y tests en verde. La mayoría
dirá que sí. Después, busca con ellos estos errores (la tabla completa está en
`PLAN.md`):

- **Un solo modelo para todo** (`booking.model.ts`). `Booking` es la fila de la
  tabla, lo que se guarda, lo que se lista y lo que responde la API. Para "mis
  reservas" hacía falta el nombre de la pista y del club, así que el modelo
  ganó `court_name?` y `club_name?`: campos que **a veces** vienen y nada en el
  tipo dice cuándo. Pregunta: _¿qué pasa cuando otra pantalla necesite el
  precio?_ Otro campo opcional más. Lo arregla separar lectura y escritura
  (capítulo 11).
- **Modelo = fila = JSON.** Renombrar una columna rompe el contrato con el
  front. Ese acoplamiento ya estaba antes, pero ahora tiene nombre de capa y
  parece intencionado.
- **Service gordo, modelo anémico.** Todas las reglas (90 minutos, horario,
  pasado, solapes, 24 h) están en `BookingsService`, mezcladas con SQL.
  `Booking` es una bolsa de datos sin comportamiento. Para probar "no se cancela
  con menos de 24 h" hace falta una BD. Lo arreglan los value objects y las entities
  (capítulos 7 y 8).
- **El service sabe de HTTP.** Lanza `HttpException(..., 409)`. La regla de
  negocio "la pista está ocupada" conoce los códigos de estado. Si mañana la
  misma lógica se llama desde una cola, ¿qué significa un 409 allí?
- **El service manda el correo.** `book` guarda la reserva, monta el HTML y
  llama al `Mailer`, todo en el mismo método. El correo del capítulo 1 tiene
  ahora una capa con nombre, pero sigue con los mismos problemas: si el SMTP
  falla, la reserva queda a medias. Lo arreglan los eventos de dominio
  (capítulo 13).
- **Tablas ajenas.** `BookingsService` lee `courts` y `clubs` con su propio
  SQL. El módulo de reservas depende del esquema interno del de clubs sin que
  ningún import lo diga. Lo arreglan los repositorios (capítulo 9).
- **N+1 en "mis reservas".** Por cada reserva, una consulta para la pista y
  otra para el club: con 50 reservas, 101 consultas. Con la red de tests no se
  nota (2 reservas, todo en local). Se ve en producción o en las trazas del
  capítulo 21.
  Quien sí lo vio fue el **linter**: `no-await-in-loop` paró el commit. Se
  apagó en línea, con un comentario que dice por qué. Otra vez el harness
  del capítulo 2 pilla algo que los tests no ven.

### Qué discutir

- **¿Por qué no hay repositorios?** Porque todavía no hay nada que proteger
  detrás de ellos. Un repositorio devuelve entidades del dominio, y aún no
  existen. Meterlo ahora sería una capa que pasa filas de un lado a otro.
  Llegan en el capítulo 9, después de los value objects y las entities.
- **Ningún test lo ha pillado.** La red de e2e protege el comportamiento, no
  el diseño. Los errores de diseño se ven al cambiar cosas, no al ejecutarlas.
- Pizarra: **29 e2e, 0 unitarios, 0 integración, ~5 s.** Sigue sin aparecer
  ninguna capa de tests por debajo: con las reglas pegadas al SQL, no hay nada
  que se pueda probar sin BD.
