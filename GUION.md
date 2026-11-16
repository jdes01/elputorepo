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

---

## Capítulo 7. Value objects: ningún primitivo

**Tag:** `cap-07` · **Idea:** un `string` puede ser cualquier cosa; una
`TimeOfDay` solo puede ser una hora válida. Si cada valor del dominio es un
objeto que no puede existir en un estado inválido, las reglas de ese valor
viven en un solo sitio y se prueban sin BD.

### Qué enseñar

1. Los value objects (`*.value-object.ts`):
   ```
   shared/    TimeOfDay  CalendarDate  TimeSlot
   clubs/     ClubId  ClubName  CourtId  CourtName  OpeningHours
   bookings/  BookingId  UserId
   ```
   Todos igual: constructor privado, una factoría que valida (`of`, `parse`)
   y lanza `InvalidValueError` si el valor no puede existir, y `equals`.
2. **Las reglas de los valores se mudan a su VO:**
   - "una franja dura 90 minutos" → `TimeSlot.startingAt`
   - "dos franjas se solapan" → `TimeSlot.overlaps`
   - "la pista cierra después de abrir" → `OpeningHours.of`
   - "la franja cabe en el horario" → `OpeningHours.contains`
   - "las franjas del día" → `OpeningHours.slots()`. El cálculo de franjas
     que estaba duplicado (al reservar y en la disponibilidad) desaparece.
3. **Los modelos ya no tienen primitivos** (`booking.model.ts`,
   `club.model.ts`). Por eso ya no pueden ser la fila de la tabla ni el JSON de
   la respuesta: aparecen `bookingFromRow` (fila → modelo) y
   `toBookingResponse` (modelo → JSON). Cambiar una columna ya no rompe el
   contrato.
4. `InvalidValueFilter`: un valor inválido viene de lo que mandó el cliente, así
   que es un 400.
5. Los **primeros unitarios**:
   ```sh
   make test:unit     # 29 tests en ~250 ms, sin docker
   ```

### El momento clave: los tests

- **Unitarios.** Rompe `TimeSlot.overlaps`: cambia `isBefore` por `!isAfter`.
  `make test:unit` falla en milisegundos, y dice qué caso se rompe ("no se
  solapa con la que empieza justo cuando acaba"). El e2e equivalente tarda 5
  segundos y necesita docker.
- **e2e: cambia uno solo, y a propósito.** "La pista cierra antes de abrir"
  pasa de 500 (lo paraba el `CHECK` de la BD) a 400 (lo para `OpeningHours`).
  ```sh
  git diff cap-06 cap-07 -- apps/padel/backend/e2e
  ```
  La regla ha subido de la BD al dominio, y el test lo cuenta.

### Qué discutir

- **¿Por qué no basta con el contrato?** zod ya valida `HH:MM`. Pero el
  contrato protege la frontera HTTP, y un VO protege el dominio venga de
  donde venga el valor: HTTP, una fila de la BD, un test o una cola. Además,
  `OpeningHours` valida algo que el contrato no puede: la relación entre dos
  campos.
- **`UserId` no puede estar vacío.** Así que "falta la cabecera" ya no lo puede
  decidir el service, que solo recibe `UserId`. El 401 se muda al controller
  (`userIdFrom`), que es donde vive HTTP.
- **Lo que no ha cambiado.** El service sigue gordo: decide si la pista
  existe, si es el pasado, si hay solape y si se puede cancelar, y lanza
  `HttpException`. `Booking` sigue teniendo `courtName?` y `clubName?` para
  "mis reservas". Los VOs saben de valores; quién puede hacer qué con ellos es
  cosa de las entities (capítulo 8).
- Pizarra: **29 e2e, 29 unitarios, 0 integración. e2e ~5 s, unitarios
  ~0,25 s.** Por primera vez la pirámide tiene base.

---

## Capítulo 8. Entities: las reglas tienen dueño

**Tag:** `cap-08` · **Idea:** un value object sabe de un valor; una entity
sabe de una cosa que vive en el tiempo y tiene identidad. Las reglas de "quién
puede hacer qué y cuándo" van en la entity, con nombres del dominio. El service
deja de decidir: carga, pide a la entity y guarda.

### Qué enseñar

1. Las tres entities (`club.entity.ts`, `court.entity.ts`, `booking.entity.ts`):
   constructor privado y **named constructors** que dicen qué está pasando.
   - `Club.register`, `Court.open(id, club, ...)`, `Booking.book({...})`:
     nacen y aplican las reglas de alta.
   - `restore(...)`: reconstruyen una que ya existía, sin reglas.
2. **Métodos de dominio**:
   - `court.slotAt(start)`: solo hay franjas en la rejilla. Reservar a las
     10:00 en una pista que abre a las 09:00 ya no se puede.
   - `court.availability(taken)`: la disponibilidad del día.
   - `booking.cancel(by, now)`: el dueño, con 24 h.
   - `Booking.book` comprueba la rejilla, el pasado y las franjas ya reservadas.
3. **`now` es un parámetro.** La entity no lee el reloj; se lo pasan. Por eso
   "no se cancela con menos de 24 h" se prueba con una fecha fija, sin esperar
   a que sea mañana.
4. **La identidad nace con la entity.** El id sale de la secuencia de la tabla
   antes de crearla (`nextId`), no al guardarla.
5. **Errores de dominio** (`club.errors.ts`, `booking.errors.ts`):
   `SlotAlreadyTaken`, `CancellationTooLate`... sin un solo código HTTP. Un
   único filtro, `domain-error.filter.ts`, los traduce. El service ya no sabe de
   HTTP.
6. **La hora del club.** `CalendarDate.at(time, timeZone)` y `CLUBS_TIME_ZONE`:
   una reserva a las 10:30 es a las 10:30 de Madrid, esté el servidor donde
   esté. El test del horario de verano lo demuestra.
7. `GLOSSARY.md`: cada término del dominio y su nombre en el código.

### El momento clave: los tests

Lanza los e2e del capítulo 7 contra este código:

```sh
git checkout cap-08
git checkout cap-07 -- apps/padel/backend/e2e
make test:e2e
git checkout cap-08 -- apps/padel/backend/e2e
```

```
× revienta con 500 si el club no existe              expected 404 to be 500
× rechaza una franja que se solapa con otra reserva  expected 400 to be 409
Tests  2 failed | 27 passed (29)
```

- El primero es un pecado arreglado: un club que no existe es un 404.
- El segundo es más interesante. El test reservaba a las 11:00 encima de una
  reserva de las 10:30. Con la rejilla, las 11:00 no es una franja: se rechaza
  antes de mirar solapes. **Una regla nueva del dominio cambió lo que significa
  un test viejo.** Ahora reserva la misma franja.

Y la pirámide **se recorta por arriba**. Con las reglas en las entities y sus
unitarios, salen de los e2e los que solo probaban reglas: "justo cuando acaba
la anterior", "acaba después del cierre", "empieza antes de abrir" y "menos de
24 h". Quedan los que solo se ven desde HTTP: un camino por caso de uso, un
test por cada código de estado, la validación y el correo.

```sh
make test:unit     # 46 en ~350 ms
make test:e2e      # 26 en ~6 s
```

### Qué discutir

- **¿Dónde está la regla de solapes?** En `Booking.book`, pero necesita las
  otras reservas (`taken`). Quien se las pasa es el service, que las lee de la
  BD. Si dos peticiones leen a la vez, ninguna ve la otra: la carrera sigue ahí.
  Una entity protege sus reglas dentro de sí misma; las que cruzan varias
  instancias necesitan algo más (capítulo 14).
- **`Booking` sigue teniendo `courtName?` y `clubName?`.** Una entity con
  campos que solo existen para una pantalla. Es el "un solo modelo para todo"
  del capítulo 6, ahora más visible: la entity carga con la vista.
- **El service ya casi no hace nada** más que SQL y orquestar. Los
  repositorios (capítulo 9) se llevan el SQL; los casos de uso (capítulo 10),
  la orquestación.
- **La petición espera al correo.** Mira los tiempos de los e2e: reservar
  tarda más de 100 ms y casi todo es SMTP. Es el pecado del capítulo 1 dando
  la cara (se discute en el capítulo 13).
- Pizarra: **26 e2e, 46 unitarios, 0 integración. e2e ~6 s, unitarios
  ~0,35 s.** Por primera vez hay menos e2e que antes y más tests en total.

---

## Capítulo 9. Repositorios: puertos y adaptadores

**Tag:** `cap-09` · **Idea:** el dominio dice qué necesita guardar y buscar
(un puerto); otra pieza decide cómo (un adaptador). Los services dejan de
saber que existe SQL.

### Qué enseñar

1. **Los puertos** (`club.repository.ts`, `court.repository.ts`,
   `booking.repository.ts`): clases abstractas con lo que el dominio necesita,
   en su idioma. `findByCourtAndDate`, `findByUser`, `nextId`. Reciben y
   devuelven **entities**, nunca filas.
2. **Los adaptadores** (`drizzle-*.repository.ts`): el puerto sobre Postgres,
   con drizzle. Es el único sitio que sabe que una reserva es una fila de
   `bookings`. Las funciones fila → entity (`toBooking`) viven aquí.
3. **El cableado** (`clubs.module.ts`):
   ```ts
   { provide: ClubRepository, useClass: DrizzleClubRepository }
   ```
   El service pide `ClubRepository` y Nest le da el de drizzle. Es una clase
   abstracta y no una interface porque las interfaces de TypeScript no existen
   en runtime y Nest necesita algo con lo que buscar.
4. **Los services ya no tienen SQL.** Compara `bookings.service.ts` con el del
   capítulo 8: cargar, pedir a la entity y guardar. Las tablas ajenas
   desaparecen: el módulo de reservas pide `CourtRepository` y
   `ClubRepository`, que `ClubsModule` exporta.
5. **Tests de integración** (`*.integration.test.ts`): los adaptadores contra
   un Postgres real, sin app ni HTTP.
   ```sh
   make test:integration     # 9 tests, ~5 s (casi todo es el contenedor)
   ```
   Pruébalo: quita el filtro por fecha de `findByCourtAndDate` y falla
   "por pista y dia, solo las de esa pista ese dia".

### El momento clave: los tests

- **Refactor puro por arriba.** Antes de tocar ningún test, los 26 e2e pasan
  con los repositorios.
- **Un e2e baja de piso.** "Las reservas de otro día no ocupan la franja"
  probaba, en el fondo, un `WHERE date = ...`. Ahora lo prueba la integración
  del repositorio, sin HTTP y sin app, y el e2e sale.

### Qué discutir

- **¿Para qué un puerto si solo hay un adaptador?** Para que el dominio y los
  services no dependan de drizzle ni de Postgres. Se nota en los tests: el
  capítulo 10 prueba los casos de uso con repositorios en memoria, sin docker.
- **Un repositorio por entidad que se guarda, no por tabla.** Y con métodos del
  dominio (`findByUser`), no un `query(sql)` genérico disfrazado.
- **El N+1 sigue ahí.** "Mis reservas" pide la pista y el club de cada
  reserva, ahora a través de los repositorios. Ordenar el código no lo arregla:
  lo arregla un modelo de lectura (capítulo 11).
- **El service ya solo orquesta.** Y orquesta tres casos de uso distintos en
  la misma clase. Eso es el capítulo 10.
- Pizarra: **25 e2e, 46 unitarios, 9 integración. e2e ~6 s, integración
  ~5 s, unitarios ~0,35 s.**

---

## Capítulo 10. Casos de uso y capas

**Tag:** `cap-10` · **Idea:** cada cosa que la app sabe hacer es una clase con
nombre propio: un caso de uso. Y cada fichero vive en su capa, con una regla
que se comprueba en cada push: el dominio no depende de nada, la aplicación
solo del dominio, y la infraestructura de todo.

### Qué enseñar

1. **La estructura** de cada módulo:
   ```
   clubs/
     domain/          entities/  value-objects/  errors/  repositories/   (puertos)
     application/     register-club  open-court  list-clubs  list-courts  (casos de uso)
     infrastructure/  controllers/  persistence/  clubs.module.ts        (adaptadores)
   ```
   El diff es sobre todo renombrados: `git show cap-10 --stat`.
2. **Los casos de uso** (`application/*.use-case.ts`): una clase y un
   `execute`. `BookCourt`, `CancelBooking`, `GetAvailability`,
   `ListMyBookings`... Los services desaparecen; los controllers piden casos de
   uso.
3. **El correo también es un puerto** (`shared/application/mailer.ts`). El
   adaptador de nodemailer vive en `shared/infrastructure/mail.module.ts`. El
   caso de uso no sabe qué es SMTP.
4. **Adaptadores en memoria** (`in-memory-*.repository.ts`, `RecordingMailer`):
   los mismos puertos, sin BD. Con ellos, los casos de uso se prueban sin
   docker (`book-court.use-case.test.ts`): "si la franja ya está reservada, ni
   reserva ni correo".
5. **Las capas se comprueban** (`configs/dependency-cruiser.cjs`):
   ```sh
   make deps:check     # también en el pre-push
   ```
   Demo: importa `drizzle-orm` en `booking.entity.ts`, o el `NodemailerMailer`
   en `book-court.use-case.ts`, y lánzalo:
   ```
   error domain-sin-paquetes: .../booking.entity.ts → .../drizzle-orm/...
   error application-sin-adaptadores: .../book-court.use-case.ts → .../mail.module.ts
   ```

### El momento clave: los tests

- **Refactor puro.** Los 25 e2e y los 9 de integración no cambian. Sin red,
  mover 40 ficheros de sitio habría sido imposible de revisar.
- **Fakes, no mocks.** Un test con mocks de este caso de uso diría "se llama a
  `findByCourtAndDate` con estos argumentos". Este dice "después de reservar,
  la reserva está guardada y hay un correo". Si mañana el caso de uso consulta
  de otra forma, este test sigue en verde; el de mocks se rompería sin que
  nada fallara de verdad.

### Qué discutir

- **`@Injectable()` en la capa de aplicación.** Es lo único de Nest que se
  permite ahí, y dependency-cruiser lo dice explícitamente. Es un pacto: un
  decorador a cambio de no escribir el cableado a mano.
- **`BookCourt` hace dos cosas:** reservar y mandar el correo. El correo no es
  parte de reservar; es algo que pasa **porque** se ha reservado. Eso es un
  evento (capítulo 13).
- **Los casos de uso de lectura devuelven entities.** `ListMyBookings` devuelve
  `Booking` con `courtName?` y `clubName?` colgando, y sigue haciendo N+1. Leer
  y escribir con el mismo modelo es el próximo capítulo.
- Pizarra: **25 e2e, 52 unitarios, 9 integración. e2e ~6 s, integración
  ~5 s, unitarios ~0,5 s.**

---

## Capítulo 11. Escribir y leer por caminos distintos

**Tag:** `cap-11` · **Idea:** escribir y leer son problemas distintos.
Escribir necesita reglas: cargar la entity, que decida, guardarla. Leer
necesita forma: dar a cada pantalla exactamente lo que pide, en una consulta.
Las dos cosas contra el mismo Postgres, pero por caminos separados (CQRS).

### Qué enseñar

1. **La estructura** de `application/`:
   ```
   commands/book-court/      book-court.command.ts   book-court.handler.ts
   commands/cancel-booking/  ...
   queries/get-availability/ get-availability.query.ts  get-availability.handler.ts  court-day.finder.ts
   queries/list-my-bookings/ list-my-bookings.query.ts  list-my-bookings.handler.ts  my-bookings.finder.ts
   ```
2. **Escritura** (`commands/`): un command con lo que se pide, en value objects,
   y un handler que usa repositorios y entities. Es lo que antes era el caso de
   uso, con otro nombre y su mensaje explícito.
3. **Lectura** (`queries/`): un query handler sobre un **finder**. El finder es
   un puerto que devuelve **vistas**: objetos planos con la forma de la
   respuesta, sin entities. Su adaptador lee de Postgres directamente
   (`drizzle-my-bookings.finder.ts`): un JOIN y listo.
4. **Lo que desaparece:**
   - El N+1 de "mis reservas": ahora es una consulta, y el `oxlint-disable` se
     va con él.
   - `courtName?` y `clubName?` de la entity `Booking`: la entity vuelve a ser
     solo de escritura.
   - Los métodos de lectura de los repositorios (`findAll`, `findByClub`,
     `findByUser`). Un repositorio solo sirve para escribir.
5. **Un controller por caso de uso** (`infrastructure/controllers/`): ocho
   ficheros pequeños, cada uno con su ruta, su contrato y su handler.
6. **La disponibilidad se calcula en el dominio, también al leer.** La rejilla
   pasa de `Court` a `OpeningHours.availability`, y el query handler la usa con
   los datos del finder. El lado de lectura no carga entities, pero sí usa
   value objects: la rejilla es la misma al reservar y al consultar.

### El momento clave: los tests

- **Los 25 e2e no cambian.** Escritura, lectura y controllers se han
  reorganizado por completo y la API responde igual:
  ```sh
  git diff cap-10 cap-11 --stat -- apps/padel/backend/e2e     # vacío
  ```
- **Los tests de integración siguen a la lectura.** "Por usuario, por fecha y
  hora" ya no prueba un repositorio: prueba `DrizzleMyBookingsFinder`, con el
  nombre de la pista y del club en una sola consulta.

### Qué discutir

- **¿Un command handler puede devolver algo?** `BookCourtHandler` devuelve la
  reserva creada, porque la API responde con ella. En un CQRS estricto
  devolvería solo el id y la respuesta se leería con una query. Aquí se elige
  lo práctico y se dice.
- **Las vistas tienen primitivos.** En el capítulo 7 quitamos todos los
  primitivos del dominio. Las vistas no son dominio: son la respuesta a una
  pregunta, y su trabajo es tener la forma que pide quien pregunta.
- **Mismo Postgres, dos caminos.** No hay base de datos de lectura ni
  proyecciones: los finders leen las mismas tablas que escriben los
  repositorios. Proyectar tablas de lectura es otro paso, que solo
  merece la pena cuando una consulta se vuelve demasiado cara.
- **Ocho controllers que se parecen mucho.** Con un controller por caso de uso,
  cada uno se puede probar solo. Eso es lo que hace el capítulo 12.
- Pizarra: **25 e2e, 52 unitarios, 12 integración.**

---

## Capítulo 12. La pirámide se da la vuelta

**Tag:** `cap-12` · **Idea:** al principio la única red posible eran los e2e:
lentos, con docker y frágiles. Ahora cada capa tiene su test, y casi todo lo que
probaban los e2e se puede probar más abajo, más rápido y con más precisión. Los
e2e se quedan en uno: el flujo que da sentido a la app.

### Qué enseñar

1. **Tests de los controllers** (`http/*.http.test.ts`): la app de Nest de
   verdad (`AppModule`, con sus controllers, handlers, validación y filtro de
   errores) con cada puerto en memoria (`http/http-app.ts`). Se le habla por
   HTTP y no necesita docker:
   ```sh
   make test:http     # 22 tests en ~2 s
   ```
   Prueban lo que es de HTTP: rutas, códigos de estado, validación, el 401 y la
   forma del JSON.
2. **Finders en memoria** (`in-memory-*.finders.ts`): leen lo que guardan los
   repositorios en memoria. Una reserva hecha por HTTP aparece después en "mis
   reservas", igual que con Postgres.
3. **`src/http.ts`**: CORS y el filtro de errores, en una función que usan
   `main.ts` y los tests. La app que se prueba es la que se despliega.
4. **Un solo e2e** (`e2e/reservar.e2e.test.ts`): crear club y pista, reservar,
   ver la franja ocupada, verla en "mis reservas" y recibir el correo. Con la
   app compilada, Postgres y SMTP de verdad.

### El momento clave: la pizarra

Pon al lado la pizarra del capítulo 3 y la de ahora:

|                               | Capítulo 3 | Capítulo 12 |
| ----------------------------- | ---------- | ----------- |
| Unitarios                     | 0          | 52 · ~1 s   |
| Controllers (HTTP en memoria) | 0          | 22 · ~2 s   |
| Integración (Postgres)        | 0          | 12 · ~5 s   |
| e2e                           | 20 · ~8 s  | 1 · ~6 s    |

Hay cuatro veces más tests, y lo que no necesita docker tarda unos 3 s. Cuando
falla uno, su nombre dice qué capa se ha roto: "409 si la franja ya está
reservada" es la traducción a HTTP; "no en una franja que ya está reservada" es
la regla del dominio.

Demo: en `domain-error.filter.ts`, cambia el 409 de `SlotAlreadyTaken` por un 400. Falla un test de controllers en milisegundos, y ninguno de dominio. Antes
lo habría encontrado un e2e después de levantar dos contenedores.

### Qué discutir

- **¿Qué cubre cada capa?**
  - Unitarios: las reglas (value objects, entities y command handlers con
    adaptadores en memoria).
  - Controllers: la traducción entre HTTP y la aplicación.
  - Integración: que los adaptadores de verdad hablan bien con Postgres.
  - e2e: que todo junto, compilado y con la infraestructura real, funciona.
- **¿Por qué no quitar también el e2e?** Porque es lo único que prueba el
  cableado real: la app compilada, las migraciones aplicadas y el SMTP de
  verdad. Un e2e que pase vale más que veinte que repiten lo que ya se prueba
  abajo.
- **Lo que ningún test de esta pirámide ve:** la carrera. Dos reservas a la vez
  siguen pudiendo pasar las dos (capítulo 14).
- Pizarra: **1 e2e, 52 unitarios, 22 controllers, 12 integración.**

---

## Capítulo 13. Eventos de dominio: reservar ya no sabe del correo

**Tag:** `cap-13` · **Idea:** el correo no es parte de reservar; es algo que
pasa **porque** se ha reservado. El command handler anuncia lo que ha pasado
(un evento), y quien quiera reaccionar se suscribe. Reservar deja de saber que
existe un correo.

### Qué enseñar

1. **El evento** (`bookings/domain/events/court-was-booked.event.ts`):
   `CourtWasBookedEvent`, en pasado, con lo que pasó en value objects.
2. **El command handler lo publica** (`book-court.handler.ts`): guarda la
   reserva y hace `events.publish(new CourtWasBookedEvent(...))`. Compara sus
   dependencias con las del capítulo 12: ya no tiene ni `Mailer` ni
   `ClubRepository`.
3. **El bus** (`shared/application/event-bus.ts` es el puerto,
   `shared/infrastructure/in-process-event-bus.ts` el adaptador): en el mismo
   proceso y en la misma petición. `BookingsModule` suscribe sus handlers al
   arrancar.
4. **El event handler** (`send-booking-confirmation.handler.ts`): escucha
   `CourtWasBookedEvent`, busca la pista y el club y manda el correo.
5. **La inyección de HTML, arreglada.** La plantilla se ha mudado, y de paso lo
   que no escribimos nosotros pasa por `escapeHtml`. Repite la demo del capítulo
   1 con un club llamado `Club <b>Norte</b>`: ahora el correo enseña las
   etiquetas en vez de poner la palabra en negrita.
6. **El SMTP caído ya no tumba la reserva.** Si un handler falla, el bus lo
   apunta en el log y sigue. Repite la otra demo del capítulo 1:
   ```sh
   docker compose stop mailpit     # reserva: 201, y el fallo del correo en el log
   docker compose start mailpit
   ```

### El momento clave: los tests

- **El test del command handler cambia de pregunta.** Antes: "¿se ha mandado
  un correo?". Ahora: "¿se ha publicado `CourtWasBookedEvent`?". Con un
  `RecordingEventBus`, sin correo de por medio.
- **El correo tiene su propio test** (`send-booking-confirmation.handler.test.ts`),
  incluido el del HTML escapado.
- **El 500 del capítulo 1 tiene test:** "si el correo no sale, la reserva es 201
  igual", en los de controllers. El e2e no cambia.

### Qué discutir

- **Añadir una reacción ya no toca reservar.** ¿Avisar al club? ¿Sumar puntos
  de fidelidad? Un handler nuevo y una línea en `onModuleInit`.
  `BookCourtHandler` no se entera.
- **El precio de este bus: un correo que falla se pierde.** Queda en el log,
  pero nadie lo reintenta. Para no perderlo, el evento tendría que guardarse en
  la misma transacción que la reserva y entregarse después (un outbox). Aquí se
  elige lo simple y se dice.
- **La petición sigue esperando al correo.** El bus es en proceso: `publish`
  espera a los handlers antes de responder. Reservar sigue tardando lo que
  tarde el SMTP.
- **¿Por qué publica el handler y no la entity?** Es la opción más directa: el
  handler sabe qué ha pasado y cuándo, justo después de guardar. La
  alternativa (que la entity apunte sus eventos y quien la guarda los
  recoja) evita olvidarse de publicar, a cambio de más piezas.
- Pizarra: **1 e2e, 56 unitarios, 23 controllers, 12 integración.**

---

## Capítulo 14. La carrera: la agenda del día como aggregate

**Tag:** `cap-14` · **Idea:** "no hay dos reservas en la misma franja" no es
una regla de una reserva: es una regla de **la agenda de una pista un día**.
Mientras cada reserva se decide por su cuenta, dos que llegan a la vez leen la
misma agenda vacía y entran las dos. El patrón aggregate dice: agrupa lo que
tiene que ser consistente, modifícalo solo a través de su raíz, y guárdalo entero
o no lo guardes.

### Qué enseñar

1. **Primero, que el bug existe** (`book-court.handler.integration.test.ts`):
   diez reservas de la misma franja a la vez, contra Postgres. Con el código del
   capítulo 13 entraban **7, 8 o 3**, según la ejecución. El pecado de la tabla
   de `PLAN.md` desde el capítulo 0, por fin con un test.
   - Detalle que sale preparando la demo: sin calentar el pool de conexiones, la
     carrera no se reproducía. La primera petición usaba la conexión ya abierta
     y terminaba mientras las otras nueve aún se conectaban. En producción, con
     el pool caliente, sí pasa. Un test de concurrencia tiene que preparar la
     concurrencia.
2. **El aggregate es la rejilla del día**
   (`bookings/domain/aggregates/court-day.aggregate.ts`):
   ```
   CourtDay (pista 1, 2099-01-10, version 3)
     09:00  libre
     10:30  reserva #7 (ana)
     12:00  libre
     ...
   ```
   `CourtDay.open` monta la rejilla con el horario de la pista y coloca las
   reservas. Reservar es ocupar una casilla libre (`day.book`); cancelar es
   liberarla (`day.cancel`). La regla de solapes desaparece como cálculo: con
   la rejilla, dos reservas solo chocan si quieren la misma casilla.
3. **Lo que se simplifica alrededor:** `Booking.book` ya solo comprueba "no en
   el pasado", `Court.slotAt` desaparece y no hay que pasar las reservas del día
   (`taken`) de un lado a otro.
4. **La versión** (tabla `court_days`, `drizzle-court-day.repository.ts`):
   cargar la agenda trae su versión. Guardarla hace
   `UPDATE court_days SET version = version + 1 WHERE ... AND version = <la leída>`.
   Si no actualiza ninguna fila, otra petición se adelantó: `CourtDayChangedMeanwhile`,
   y no se guarda nada. Un día sin fila es versión 0: el `INSERT` con
   `ON CONFLICT DO NOTHING` hace lo mismo para la primera reserva.
5. **El reintento** (`retry-when-court-day-changes.ts`): si la agenda cambió,
   se vuelve a cargar (ya con el otro cambio dentro) y se vuelve a decidir. Si la
   franja ahora está ocupada, `SlotAlreadyTaken`, un 409 normal. Si era otra
   franja, entra. Reservar y cancelar lo usan igual.
6. **Una sola puerta.** `BookingRepository` desaparece: las reservas se crean,
   se cancelan y se guardan solo a través de `CourtDayRepository`. En la BD
   siguen en su tabla `bookings`. El aggregate es una frontera de consistencia
   en el código, no una tabla.

### El momento clave: los tests

```sh
make test:integration
```

- "Diez reservas a la vez de la misma franja: solo entra una": en verde.
- "Cinco reservas a la vez de franjas distintas: entran todas": la versión no
  bloquea reservas que no chocan, solo obliga a reintentar.
- Demo: en `drizzle-court-day.repository.ts`, borra la línea
  `if (claimed.length === 0) throw new CourtDayChangedMeanwhile();` y lánzalo.
  Entran **las diez**.
- Los mismos escenarios, en unitarios y sin docker
  (`book-court.handler.test.ts`), con la agenda en memoria, que también lleva
  versión. Y la rejilla tiene los suyos (`court-day.aggregate.test.ts`): franja
  fuera de la rejilla, ocupada, la de al lado, cancelar la deja libre.

### Qué discutir

- **¿Por qué no una constraint en la BD?** Una exclusion constraint de Postgres
  sobre los rangos de hora también lo impediría, y es una buena segunda red.
  Pero la regla quedaría en SQL, lejos del dominio. Con el aggregate, la regla
  está en un sitio y la BD solo garantiza "nadie guardó encima de lo que leíste".
- **¿Por qué la agenda de un día y no la pista entera?** El tamaño del
  aggregate es el de la regla. Si fuera la pista, dos reservas de días distintos
  se pisarían la versión sin necesidad. Si fuera la reserva, no protegería nada.
- **Bloqueo optimista vs. pesimista.** Un `SELECT ... FOR UPDATE` también
  serviría: bloquea al leer y los demás esperan. El optimista no bloquea nunca y
  reintenta cuando choca, que sale barato si los choques son raros, y aquí lo
  son: dos personas en la misma pista y el mismo día al mismo milisegundo.
- **La lectura no pasa por el aggregate.** La disponibilidad sigue saliendo de
  su finder (capítulo 11): la rejilla existe para decidir, no para listar.
- Pizarra: **1 e2e, 60 unitarios, 23 controllers, 15 integración.**

---

## Capítulo 15. Cancelar deja de borrar

**Tag:** `cap-15` · **Idea:** desde el capítulo 0, cancelar hacía `DELETE`. La
reserva desaparecía, y con ella cualquier forma de saber que existió. Borrar es
perder información; el histórico es un requisito que nadie pide hasta el día
que hace falta (una reclamación, una estadística, un cliente que cancela
siempre).

### Qué enseñar

1. **La columna** (`migrations/0002_cancelled-at.sql`): `bookings.cancelled_at`.
2. **La reserva sabe que está cancelada** (`booking.entity.ts`):
   `booking.cancel(by, now)` comprueba las reglas y se marca. Una cancelada no
   se puede cancelar otra vez (`BookingAlreadyCancelled`).
3. **La agenda distingue "existe" de "ocupa"** (`court-day.aggregate.ts`):
   `CourtDay.open` solo coloca en la rejilla las reservas activas, y
   `day.cancel` devuelve la reserva cancelada.
4. **Guardar marca, no borra** (`drizzle-court-day.repository.ts`): un
   `UPDATE ... SET cancelled_at`. Las lecturas (los dos finders y la agenda)
   leen solo las activas.
5. **El evento** (`booking-was-cancelled.event.ts`): `CancelBookingHandler`
   publica `BookingWasCancelledEvent`, y un handler nuevo
   (`send-cancellation-confirmation.handler.ts`) manda el correo de
   cancelación.

### El momento clave: los tests

- En los de controllers: "la cancelada deja de salir en mis reservas, y llega el
  correo de cancelación". Los asuntos de los correos de ese usuario son
  `['Reserva confirmada', 'Reserva cancelada']`.
- En integración: después de cancelar, la fila **sigue ahí** con su
  `cancelled_at`, y la franja vuelve a estar libre.
- Cancelar dos veces es un 404: para la agenda, una reserva cancelada ya no
  ocupa nada que cancelar.

### Qué discutir

- **Añadir el correo de cancelación no ha tocado cancelar.** Un handler nuevo y
  una línea en `onModuleInit`, la promesa del capítulo 13 cumplida.
- **Soft delete tiene un precio.** Cada consulta que lee reservas tiene que
  acordarse de `cancelled_at IS NULL`. Aquí son tres sitios, y los tres tienen
  test. En una app grande es una fuente clásica de bugs; por eso conviene que
  pocas piezas lean la tabla directamente.
- **El histórico está, pero nadie lo enseña.** "Mis reservas" sigue mostrando
  solo las activas. Un "historial" sería un finder nuevo, sin tocar la
  escritura.
- Pizarra: **1 e2e, 65 unitarios, 25 controllers, 15 integración.**

---

## Capítulo 16. El modelo de lectura en Mongo

**Tag:** `cap-16` · **Idea:** en el capítulo 11 separamos escribir y leer en el
código, pero las dos cosas seguían leyendo las mismas tablas. Ahora la lectura
tiene **su propia base de datos**, con documentos que ya tienen la forma de cada
pantalla, y se mantiene al día escuchando los eventos que publica la escritura.
Postgres sigue siendo la fuente de verdad; Mongo es una copia pensada para leer.

### Qué enseñar

1. **Mongo en el compose** y `MONGO_URL` en la config, igual que la BD y el
   correo.
2. **Los documentos** (`bookings/infrastructure/read-model/read-model.ts`):
   - `courts`: el horario y los nombres de cada pista.
   - `court_days`: las franjas reservadas de una pista un día.
   - `my_bookings`: una fila por reserva, ya con el nombre de la pista y del
     club. Desnormalizado a propósito: leer no necesita ni un JOIN.
3. **Un evento nuevo**, `CourtWasOpenedEvent`: abrir una pista también es algo
   que pasa, y la lectura necesita saberlo para conocer su horario.
4. **El proyector** (`mongo-read-model.projector.ts`): escucha
   `CourtWasOpenedEvent`, `CourtWasBookedEvent` y `BookingWasCancelledEvent`, y
   actualiza los documentos. Cada escritura es idempotente (upsert,
   `$addToSet`, `$pull`): recibir el mismo evento dos veces deja lo mismo.
5. **Los finders cambian de adaptador**, nada más. `MongoCourtDayFinder` y
   `MongoMyBookingsFinder` implementan los mismos puertos del capítulo 11. Los
   query handlers, los controllers y los tests de controllers no se enteran.
6. **Reconstruir** (`rebuild-read-model.ts`):
   ```sh
   make read-model
   ```
   Tira las colecciones y vuelve a pasar por el proyector un evento por cada
   pista y cada reserva activa de Postgres. Para cuando se pierde un evento, se
   cambia la forma de una vista o se arranca con datos que ya existían.

### El momento clave: la grieta

```sh
make dev
docker compose stop mongo
# reserva desde la web: 201, en unos 2 s. La reserva está en Postgres.
docker compose start mongo
# la disponibilidad dice que esa franja está libre
make read-model
# ahora sí está ocupada
```

La escritura funcionó, pero el evento llegó a un Mongo caído: el proyector
falló, el bus lo apuntó en el log y siguió. El modelo de lectura se quedó
desfasado y **nadie lo va a arreglar solo**. Es el precio de tener dos bases de
datos sin una transacción que las una: consistencia eventual, y eventual a
veces significa "cuando alguien lo rehaga".

En los tests:

- Integración (`mongo-read-model.integration.test.ts`), contra un Mongo de usar
  y tirar: proyectar, cancelar, el mismo evento dos veces y la reconstrucción
  entera desde Postgres.
- El e2e no cambia y pasa: reserva y lee la disponibilidad y "mis reservas" de
  Mongo.

### Qué discutir

- **¿Por qué no lo arreglamos?** Porque arreglarlo bien es guardar el evento en
  la misma transacción que la reserva y entregarlo después hasta que entre (un
  outbox), y eso ya es otra pieza. Aquí se elige ver la grieta y tener con qué
  taparla (`make read-model`).
- **Los 2 s.** Con Mongo caído, la reserva tarda lo que el cliente de Mongo
  espera antes de rendirse (`serverSelectionTimeoutMS` en `mongo.module.ts`).
  Con el valor por defecto, 30 s: la petición se quedaba colgada y, si Mongo
  volvía a tiempo, la escritura acababa entrando. Preparando esta demo pasó
  justo eso. La petición espera a la lectura igual que esperaba al correo.
- **Consistencia eventual en la misma petición.** El bus es en proceso: cuando
  la API responde, el proyector ya ha escrito en Mongo. Con una cola de por
  medio no sería así, y "acabo de reservar y no la veo" sería un problema de
  producto, no de código.
- **¿Qué se proyecta y qué no?** Los listados de clubs y pistas siguen leyendo
  de Postgres: no les hace falta otra cosa. Se proyecta lo que se lee mucho o
  tiene una forma muy distinta de cómo se guarda.
- Pizarra: **1 e2e, 67 unitarios, 25 controllers, 18 integración.**

## Capítulo 17. Caché con Redis

**Tag:** `cap-17` · **Idea:** la disponibilidad es lo que más se lee. Antes de
ir a Mongo se mira en Redis; si está, se responde de memoria. Cuando la agenda
cambia, el proyector borra esa entrada. Y si Redis se cae, la app sigue: una
caché caída es una caché vacía.

### Qué enseñar

1. **Redis en el compose** y `REDIS_URL` en la config. `redis.module.ts` crea el
   cliente con `disableOfflineQueue`: si Redis no está, el comando falla al
   momento en vez de quedarse esperando a que vuelva.
2. **El puerto** `CourtDayCache` (`read-model/cache/court-day.cache.ts`): `get`,
   `set`, `evict` y `clear`. Dos adaptadores: Redis y en memoria.
3. **Cache-aside** (`cached-court-day.finder.ts`): primero la caché; si no
   está, Mongo, y se guarda para la próxima. Implementa el mismo
   `CourtDayFinder`: el query handler no sabe que hay caché. Un decorador más
   sobre el puerto del capítulo 11.
4. **Invalidar después de escribir**: el proyector escribe en Mongo y luego
   hace `evict` de esa pista y ese día. La siguiente lectura vuelve a Mongo y ve
   el dato nuevo. `make read-model` también vacía la caché.
5. **El TTL como red de seguridad**: cada entrada caduca a los 60 s
   (`redis-court-day.cache.ts`). Si una invalidación se pierde, el dato viejo
   dura como mucho eso.

### El momento clave: apagar Redis

```sh
make dev
# disponibilidad de una pista: la primera vez va a Mongo
docker compose exec redis redis-cli keys 'court-day:*'   # ahí está, ttl 60
# reservar una franja de esa pista
docker compose exec redis redis-cli keys 'court-day:*'   # vacío: invalidada
docker compose stop redis
# la disponibilidad sigue respondiendo 200, en milisegundos
docker compose start redis
# la siguiente lectura la vuelve a cachear
```

Con Redis caído, el log dice `cache: Redis no responde, se sigue sin cache` y
la petición va directa a Mongo. Ni error ni espera: al contrario que con Mongo
en el capítulo anterior, aquí perder la pieza solo cuesta velocidad.

En los tests:

- Unitarios (`cached-court-day.finder.test.ts`): con una fuente que cuenta
  lecturas y la caché en memoria. La segunda lectura no llega a la fuente;
  tras invalidar, sí; una pista que no existe no se guarda.
- Integración (`redis-court-day.cache.integration.test.ts`), contra un Redis y
  un Mongo de usar y tirar: el TTL, que reservar invalida, que `clear` solo
  borra agendas y que con el cliente cerrado todo sigue funcionando.
- Los tests de controllers no tocan Redis: la disponibilidad sale del finder en
  memoria, como antes.

### Qué discutir

- **La carrera lectura–escritura.** Una lectura saca la agenda de Mongo; entre
  medias, una reserva escribe y borra la entrada; la lectura termina y guarda
  la agenda vieja. Esa entrada vieja vive hasta el TTL. Por eso hay TTL aunque
  se invalide, y por eso es corto.
- **¿Invalidar o actualizar?** Borrar es más simple y nunca deja la caché con
  un dato que Mongo no tiene. Escribir el dato nuevo ahorra una lectura, pero
  hay que calcularlo bien en dos sitios.
- **Qué no se cachea.** "Mis reservas" cambia con cada reserva del usuario y lo
  lee solo él: la caché casi nunca acertaría. Una pista que no existe tampoco:
  si se crea luego, se vería tarde.
- **¿Hacía falta?** Mongo ya responde en milisegundos. La caché se pone cuando
  una medida dice que la lectura duele, no antes. Aquí se pone para ver el
  patrón y lo que cuesta mantenerlo coherente.
- Pizarra: **1 e2e, 70 unitarios, 25 controllers, 22 integración.**

---

## Capítulo 18. Dockerizar backend y frontend

**Tag:** `cap-18` · **Idea:** hasta aquí la app solo corre en una máquina con
mise, pnpm y el repo entero. Una imagen es la app **y** lo que necesita para
correr, y nada más: lo mismo en el portátil, en CI y en un servidor. El
capítulo no cambia ni una línea de la app, salvo un script de migraciones.

### Qué enseñar

1. **Multi-stage** (`apps/padel/backend/Dockerfile`). Un stage `builder`
   instala todo (con devDependencies) y compila con `task backend:build`: pesa
   **1,2 GB**. La imagen final no hereda de él, solo **copia** lo compilado
   (`COPY --from=builder`). Pesa **343 MB**, de los cuales 251 son node.
2. **Sin devDependencies.** Un stage `prod-deps` hace
   `pnpm install --prod --filter "@padel/backend..."`: solo lo que el backend
   necesita en runtime (unos 80 MB, con los clientes de Mongo y Redis). Sin
   swc, sin drizzle-kit, sin vitest, sin testcontainers.
3. **`contracts` se consume como fuente**, así que aquí no sirve `pnpm deploy`:
   copia los paquetes del workspace dentro de `node_modules`, y node no quita
   los tipos de un `.ts` que cuelga de `node_modules`. Con `--filter` los
   paquetes siguen siendo enlaces a `apps/padel/contracts/src`, que se copia
   tal cual.
4. **Caché de capas.** Un stage `manifests` solo con el lockfile y los
   `package.json`: tocar código no repite `pnpm install`. Hacen falta los
   `package.json` de **todo** el workspace, no solo los del backend, o
   `--frozen-lockfile` aborta.
5. **Sin root y sin ruido.** `USER node` en el backend; el frontend usa
   `nginx-unprivileged`, que escucha en el 8080. `.dockerignore` en la raíz deja
   fuera `node_modules`, `dist`, `.git` y cualquier `.env`. El contexto de build
   es la **raíz** del repo (el lockfile y `contracts` tienen que entrar), por
   eso los Dockerfiles viven en cada app pero se construyen desde arriba.
6. **El front** (`apps/padel/frontend/Dockerfile`): vite construye el bundle y
   nginx lo sirve estático. De todo el build solo viaja una carpeta de HTML y
   JS: **82 MB**, casi todo nginx.
7. **Las migraciones** (`src/migrate.ts`): un servicio one-shot del compose,
   `migrate`, que usa **la misma imagen** que la api con otro comando
   (`node dist/src/migrate.js`), aplica las migraciones y sale. La api tiene
   `depends_on: migrate: service_completed_successfully`: no arranca hasta que
   termina bien. No se usa `drizzle-kit migrate` porque es una devDependency y
   no viaja en la imagen; el migrador de `drizzle-orm` lee las mismas
   carpetas SQL (es el que ya usan los e2e).
8. **Un perfil del compose.** `postgres`, `mongo`, `redis` y `mailpit` no
   llevan perfil: `docker compose up` sigue levantando solo eso (`make up`,
   `make dev`). `migrate`, `api` y `front` llevan `profiles: [app]`, y las
   URLs que valida `config.ts` (las cuatro) se escriben una vez en un ancla
   YAML que comparten `migrate` y `api`. `make app` lo levanta todo y espera a
   que esté sano; `make images` solo construye. `make down` ahora pasa el
   perfil, porque un `down` sin él no para lo que lo lleva.
9. **Healthchecks donde alguien espera.** La api se conecta a Mongo y a Redis
   al arrancar, así que los espera `service_healthy` (un `ping` en cada uno),
   igual que a Postgres a través de `migrate`. El front espera a la api.

### El momento clave: en vivo

```sh
make app                       # construye, migra y levanta, esperando
curl -XPOST :3000/clubs ...    # club, pista y reserva contra la api en docker
docker compose exec redis redis-cli keys '*'   # court-day:1:... tras leer
```

Abrir Mailpit (:8025): ahí está "Reserva confirmada". Abrir :8080: el front.
La disponibilidad y "mis reservas" salen del Mongo del compose, y la agenda
leída queda en su Redis. Con `docker compose ps -a` se ve `migrate` en
`Exited (0)`: no es un fallo, es un servicio que hizo su trabajo.

### Qué discutir

- **¿Dónde se migra?** Un one-shot al levantar es lo más simple y vale con una
  sola réplica de la api. Con varias, dos arranques simultáneos migrarían a la
  vez; ahí se migra como un paso del despliegue, antes de levantar las réplicas.
- **¿Y el modelo de lectura?** Postgres y Mongo nacen vacíos a la vez, así que
  no hay nada que rehacer. Si se levantara contra un Postgres con datos y un
  Mongo nuevo, haría falta el `rebuild-read-model` del capítulo 16, que también
  viaja en la imagen.
- **Alpine y los binarios nativos.** pnpm resuelve los binarios opcionales según
  la libc de donde instala. Aquí se instala **dentro** del contenedor, así que
  todo es musl y es coherente. Si se instalara en el host y se montara en el
  contenedor, no cargarían: por eso la regla es una sola libc por flujo.
- **La URL del api del front está en el código** (`http://localhost:3000`): sirve
  porque el navegador está en la misma máquina que el compose. En un servidor
  real no, y se arregla con configuración en runtime.
- **Las credenciales del compose siguen en claro.** Es el entorno de
  desarrollo; en un despliegue de verdad las pone quien despliega.
- **Qué falta:** versionar la imagen (se hará en el 19, con el sha del commit) y
  escanearla.
- Pizarra: **1 e2e, 70 unitarios, 25 controllers, 22 integración.** No cambia:
  el capítulo no toca la app.

---

## Capítulo 19. CI/CD en GitHub Actions llamando a los mismos `task`

**Tag:** `cap-19` · **Idea:** una CI que define sus propios comandos es una
segunda definición de "qué es estar bien", y tarde o temprano discrepa de la
primera. Aquí la CI no sabe nada: cada paso es un `task` que ya existía. El
workflow solo decide **dónde** y **cuándo** se ejecutan.

### Qué enseñar

1. **CI** (`.github/workflows/ci.yml`), en cada push y cada PR. El job `check`
   llama, uno por paso, a `task lint`, `format:check`, `typecheck`, `deps:check`,
   `build`, `test:unit`, `test:http`, `test:integration` y `test:e2e`: los mismos
   nombres que en el Makefile y en lefthook. Un paso por task, y no un solo
   `task test`, para que la lista de pasos de GitHub diga cuál ha fallado. Los
   runners de GitHub traen docker, así que integración y e2e levantan sus
   Postgres, Mongo, Redis y Mailpit (testcontainers) igual que en local. La CI
   no declara ningún servicio: cada suite trae los suyos.
2. **Las mismas versiones que en el portátil** (`jdx/mise-action`). Instala lo
   que dicen `mise.toml` (node) y `package.json` (pnpm, su `packageManager`):
   subir una versión sigue siendo una edición, y CI no tiene una copia que
   olvidar. `actionlint` entra por el mismo camino (`mise.toml`).
3. **Un job `images` en CI**: `make app`, el mismo comando del capítulo 18.
   Construye las dos imágenes y levanta el perfil entero (Postgres, Mongo,
   Redis, Mailpit, migraciones, api y front), esperando a los healthchecks. Un
   Dockerfile roto, o una api que no arranca porque no llega a Mongo o a Redis,
   se ve en el PR y no al hacer merge.
4. **CD** (`.github/workflows/cd.yml`), en cada push a `main`: construye las
   dos imágenes (una `matrix` backend/frontend), hace login en GHCR con el
   `GITHUB_TOKEN` y las publica. `docker/metadata-action` calcula el nombre (en
   minúsculas, como exige GHCR) y el tag: el **sha completo** del commit. Nada
   de `latest`: cada imagen publicada se corresponde con un commit y se puede
   volver a él.
5. **Permisos mínimos.** El workflow entero es `contents: read`; solo el job de
   publicar sube a `packages: write`.
6. **Los workflows también se lintean** (`task lint:workflows`, actionlint,
   enganchado a `task lint`): una expresión mal escrita o una action sin versión
   falla en el commit, no tras esperar a un runner. Las actions se fijan por
   versión mayor (`actions/checkout@v4`), y la de terceros que no es de
   GitHub/Docker (`jdx/mise-action`) por **sha** del commit, con la versión en un
   comentario: un tag se puede mover, un sha no.

### El momento clave: cómo se valida sin remoto

No hay remoto: nada de esto se ha visto correr en GitHub. Lo que sí:

- **`actionlint`** (`make lint`): los dos workflows pasan; y un workflow con
  `github.evnt.name` y un `uses: actions/checkout` sin versión falla con los dos
  errores, que es lo que se espera de un linter.
- **`act`** corre el workflow en un contenedor con la imagen de un runner de
  Ubuntu. El job `check` pasó **entero**, e2e incluidos (el runner instala mise,
  mise instala node, pnpm y actionlint, y los tests levantan sus propios
  Postgres, Mongo, Redis y Mailpit contra el docker de la máquina): 70
  unitarios, 25 de controllers, 22 de integración y el e2e.
- El job `images` es `make app`, y ese comando ya se vio funcionar en el
  capítulo 18. Con `act` publica los puertos del compose en la máquina, así que
  solo se puede correr con esos puertos libres.
- Lo que **no se pudo probar**: el job de CD. Hace login y `push` a ghcr.io con
  el `GITHUB_TOKEN` de un repositorio real, y sin remoto no hay ni token ni
  paquete. Tampoco se ha visto que los permisos se comporten igual en un runner
  de GitHub: `act` no los imita del todo.

### Qué discutir

- **"Mismos `task`" no es "mismo entorno".** Cierra la brecha de los comandos y
  la de las versiones (mise), pero no la del sistema (un runner no es tu
  portátil). Los tests que levantan sus contenedores son lo que menos depende
  de eso.
- **CD no espera a CI.** Se publica lo que llega a `main`, y a `main` solo llega
  lo que ya pasó por un PR verde (se exige en la protección de la rama). Si no
  se quiere fiar de eso, se une CD a CI con `needs`, o con `workflow_run`.
- **Push y PR a la vez.** Un push a una rama con PR abierto dispara CI dos veces
  (una por `push`, otra por `pull_request`). `concurrency` cancela las
  repetidas de la misma rama, no las de los dos eventos. Es el precio de
  "en cada push y PR".
- **Esta CI es lenta a propósito**: un job, todo en serie, sin caché de pnpm. Es
  la versión más fácil de leer y de depurar; paralelizarla y cachearla es el
  capítulo 22.
- **Los secretos.** Aquí no hay ninguno: el `GITHUB_TOKEN` lo da GitHub a cada
  ejecución. Cuando un workflow necesite uno de verdad, vivirá en `secrets`,
  nunca en el repositorio.
- Pizarra: **1 e2e, 70 unitarios, 25 controllers, 22 integración.** No cambia:
  el capítulo no toca la app.

---

## Capítulo 20. Logging estructurado con correlation id

**Tag:** `cap-20` · **Idea:** un `console.log('reserva creada', 7)` sirve con
una sola petición. Con veinte a la vez, las líneas se mezclan y no hay forma de
saber cuáles son de la misma. Los logs pasan a ser JSON, una línea por hecho, y
cada petición lleva un id que sale en todas sus líneas: las del command
handler, las del event handler que manda el correo y las de la caché cuando
Redis falla.

### Qué enseñar

1. **Logs en JSON** (`shared/infrastructure/logging.ts`, `nestjs-pino`). Una
   línea = un objeto con `level`, `time`, `msg` y los campos que importan
   (`bookingId`, `courtId`). Se puede filtrar con `jq` y, en el capítulo
   siguiente, indexar en Loki. Los `console.*` del backend desaparecen: los de
   los handlers, `main.ts`, el event bus, el cliente de Redis
   (`redis.module.ts`) y la caché (`redis-court-day.cache.ts`). El nivel se pone
   con `LOG_LEVEL` (`config.ts`).
2. **El id de correlación**: `X-Request-Id` (o `X-Correlation-Id`) si el cliente
   lo manda, uno nuevo si no, y siempre devuelto en la respuesta. El cliente puede
   así anotar el id de una petición que falló y pedirnos "las líneas de esta".
3. **Sin pasar el id por parámetro.** `nestjs-pino` guarda el logger de la
   petición en un `AsyncLocalStorage`. Los handlers escriben con el `Logger` de
   Nest, sin inyección y sin saber de HTTP, y su línea sale con el id de la
   petición que los ejecuta. El event handler del correo y el proyector corren
   dentro de la misma petición (el bus es en proceso), así que lo que
   escriben sale con el mismo id.
4. **Fuera de una petición no hay id.** Los scripts que no levantan Nest
   (`migrate.ts`, `rebuild-read-model.ts`) usan `pino` a secas: mismo formato,
   sin id. Y los avisos del cliente de Redis al perder la conexión salen sin id,
   porque no los provoca ninguna petición: los provoca el socket.
5. **La regla de lint** (`configs/oxlintrc.json`): el override que apagaba
   `no-console` en el backend desaparece. Un `console.log` nuevo rompe el lint.

### El momento clave: el mismo id en todas las líneas

```sh
node dist/src/main.js > api.log     # con la config de siempre
curl -XPOST :3000/bookings -H 'x-request-id: clase-20' -H 'x-user-id: ana@padel.local' \
  -H 'content-type: application/json' -d '{"courtId":1,"date":"...","start":"10:30"}'
jq -c 'select(.correlationId == "clase-20") | {context, msg}' api.log
```

Salen tres líneas con `clase-20`: `reserva creada` (`BookCourtHandler`),
`correo de confirmacion enviado` (`SendBookingConfirmationHandler`) y
`request completed` (la petición, con su método, ruta, estado y duración). Sin
la cabecera, el id lo genera el servidor y vuelve en la respuesta.

Ahora `docker compose stop redis` y se pide la disponibilidad con
`x-request-id: sin-redis`: responde 200 y aparecen dos `warn` de
`RedisCourtDayCache` ("Redis no responde, se sigue sin cache", al leer y al
guardar) con ese id. El fallo de la caché ya se puede atar a la petición que lo
sufrió. Entre medias, el cliente de Redis apunta sus `error` de conexión, sin
id.

En los tests:

- Controllers: la cabecera de respuesta es la que se mandó, las tres líneas de
  esa petición llevan su id, y sin cabecera se genera un UUID. El logger
  escribe a una lista, no a la salida del test.
- Unitarios e integración no arrancan app: un `setupFile`
  (`vitest.silence-logs.ts`) apaga el logger de Nest para que no ensucie la
  salida. El test del event bus espía `Logger.prototype.error` en vez de
  `console.error`.

### Qué discutir

- **Correlation id vs. trace id.** Hoy el id nace en el servidor (o en el
  cliente) y solo une líneas de log. En el capítulo 21 aparece el trace id de
  OpenTelemetry, que une además los spans, y los dos conviven en cada línea.
- **Qué no loguear.** Las cabeceras de la petición viajan en `request completed`
  (`x-user-id` es un email). En producción se redactan (`redact` de pino) o no
  se sacan.
- **Un id que viene de fuera es un dato no fiable.** Va a los logs: JSON ya
  escapa saltos de línea, pero conviene limitar su longitud si el servidor
  queda expuesto a internet.
- **El event bus en proceso** hace posible que el id llegue al correo y al
  proyector gratis. Con una cola de verdad, el id tendría que viajar dentro del
  mensaje.
- **¿`warn` o `error` para la caché?** La petición sale bien, así que no es un
  error de la app: es una pieza degradada. El nivel decide qué despierta a
  alguien a las tres de la mañana.
- Pizarra: **1 e2e, 70 unitarios, 27 controllers, 22 integración.**

---

## Capítulo 21. Grafana, Loki, Tempo, Prometheus y OpenTelemetry

**Tag:** `cap-21` · **Idea:** los logs dicen _qué_ pasó; no dicen _dónde se fue
el tiempo_. OpenTelemetry añade las otras dos señales (trazas y métricas) y
enlaza las tres con un identificador: el `trace_id`. Todo llega a una sola
imagen, `grafana/otel-lgtm`: Grafana, Loki (logs), Tempo (trazas), Prometheus
(métricas) y un colector OTLP.

### Qué enseñar

1. **El compose** (`docker-compose.yml`): un servicio `lgtm` con la versión
   fijada, en un perfil (`make observability`): la imagen pesa casi 4 GB y para
   tocar el backend no hace falta. Grafana en `localhost:3001`, el colector en
   `4318` (OTLP por HTTP). `make down` y `make reset` pasan a
   `--profile '*'`, para parar también este.
2. **El SDK** (`src/instrumentation.ts`): `NodeSDK` con las instrumentaciones de
   http, express, nest, `pg`, `mongodb`, `redis` y `pino`. Se importa **el
   primero** en `main.ts`, porque parchean cada librería cuando se carga y lo
   que ya estaba cargado no se parchea. Las de Mongo y Redis son dos líneas: el
   driver y el cliente que ya usamos tienen instrumentación, y con ellas la
   traza enseña las dos bases de datos que añadimos en los capítulos 16 y 17.
3. **Un solo interruptor**: `OTEL_EXPORTER_OTLP_ENDPOINT`. Sin ella no arranca
   nada y la app va igual; los tests nunca la necesitan. Con ella, el SDK exporta
   trazas, métricas y logs a esa dirección. `config.ts` la valida como el resto
   (`config.test.ts`: sin ella es válida, con una URL se usa, con otra cosa la
   app no arranca).
   `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 make dev`.
4. **Un span a mano para el correo** (`mail.module.ts`): nodemailer no tiene
   instrumentación, así que `smtp.send` envuelve `sendMail`. Sin SDK, la API de
   OpenTelemetry no hace nada: es una llamada gratis.
5. **Logs con `trace_id`**: la instrumentación de pino añade `trace_id` y
   `span_id` a cada línea y la manda también a Loki. Los dos ids conviven: el
   `correlationId` del capítulo anterior nace en el cliente o en el borde; el
   `trace_id` lo entiende Tempo.

### El momento clave: qué buscar en Grafana

`make up` y `make observability`, el backend con la variable, una reserva, la
disponibilidad dos veces y "mis reservas". En Grafana, _Explore_:

- **Tempo, una reserva entera.** `{ name = "POST /bookings" }`. Unos 120 ms, y
  se lee el capítulo 13 al 17 de un vistazo: las consultas de la agenda a
  Postgres, la escritura entre `BEGIN` y `COMMIT`, y después lo que cuelga de
  los eventos: `update court_days` y `update my_bookings` en Mongo (el
  proyector), `redis-DEL court-day:...` (la invalidación de la caché) y
  `smtp.send`, unos 50 ms con Mailpit. Todo **dentro de la petición**: quien
  reserva espera al correo y al modelo de lectura, porque el event bus es en
  proceso. Con un SMTP de verdad serían segundos, y esa es la conversación para
  el siguiente paso (una cola).
- **Tempo, la caché funcionando.** `{ name =~ "GET .*availability" }`. La
  primera lectura: `redis-GET` (falla), `find courts` y `find court_days` en
  Mongo, y `redis-SET`. La de después de reservar, lo mismo, porque la reserva
  la invalidó. Una tercera sería solo `redis-GET`.
- **Tempo, "mis reservas".** `{ name = "GET /me/bookings" }`: un solo
  `find my_bookings`, ni una consulta a Postgres. El N+1 del capítulo 6 se
  arregló con un JOIN en el 11 y desapareció del todo con el modelo de lectura
  del 16, y aquí se ve sin leer el código.
- **Loki, los logs con su traza.**
  `{service_name="padel-backend"} | correlationId="clase-21"`. Cada línea trae
  `correlationId`, `trace_id` y `bookingId`; desde el `trace_id` se salta a la
  traza en Tempo, y desde la traza se llega a sus logs.
- **Prometheus, métricas.** `http_server_request_duration_seconds_count` por
  `http_route` y, para el p95 por ruta:
  `histogram_quantile(0.95, sum by (le, http_route) (rate(http_server_request_duration_seconds_bucket[5m])))`.
  Las métricas se exportan cada 60 s por defecto (`OTEL_METRIC_EXPORT_INTERVAL=5000`
  lo baja a 5 s para la clase).

### Qué discutir

- **Tres señales, un identificador.** Un log aislado no tiene contexto, una
  métrica agregada no tiene detalle y una traza no dice qué se escribió. El
  `trace_id` es lo que las une.
- **Autoinstrumentación vs. spans a mano.** Lo que tiene instrumentación (http,
  pg, mongodb, redis) sale gratis; lo que no (el correo) se envuelve a mano. Se
  desactivan los spans de cada middleware de express (`ignoreLayersType`): un
  span por capa esconde lo que se quiere ver.
- **La traza como herramienta de diseño, no solo de operación.** Aquí vale para
  comprobar un refactor: el número de consultas de una petición, o si una
  lectura toca la caché, es un hecho observable, no una opinión.
- **Cardinalidad.** `http.route` es `/courts/:courtId/availability`;
  `http.target` sería `/courts/1/availability?date=...`, una etiqueta distinta
  por petición que mata a Prometheus.
- **Qué falta:** muestreo (hoy se exporta todo), alertas y dashboards.
- Pizarra: **1 e2e, 73 unitarios, 27 controllers, 22 integración.**
