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
