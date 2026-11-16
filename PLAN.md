# Pádel: de guarro a bien, commit a commit

Clubs con pistas de pádel y personas que las reservan. El commit 0 funciona pero
está mal hecho a propósito; cada commit siguiente arregla un pecado concreto.
Cómo arrancarla: `README.md`. El guion de la clase: `GUION.md`.

## Casos de uso

1. Crear club
2. Crear pista en un club (con horario de apertura)
3. Reservar pista (franja de 90 min), con correo de confirmación
4. Cancelar reserva
5. Ver disponibilidad de una pista en un día
6. Ver mis reservas

Reglas: sin solapes, dentro del horario, no en el pasado, cancela solo el dueño y
con 24 h de antelación. El usuario llega en la cabecera `X-User-Id`, que es su
email.

## Pecados de los capítulos 0 y 1

| Pecado                                                                                                    | Lo arregla |
| --------------------------------------------------------------------------------------------------------- | ---------- |
| Sin harness: ni versión de node fijada, ni lint, ni formato, ni puerta común                              | 2          |
| Sin tests: para saber si el correo sale hay que abrir Mailpit y mirar                                     | 3          |
| Sin validar entrada: un body incompleto revienta con 500                                                  | 4          |
| **SQL injection** en `POST /clubs` (nombre interpolado)                                                   | 4          |
| `any` por todas partes                                                                                    | 4, 7       |
| `CREATE TABLE IF NOT EXISTS` al arrancar, sin FKs ni constraints                                          | 5          |
| Conexión a BD y servidor de correo hardcodeados                                                           | 5          |
| Un `AppController` con todo: SQL a pelo y lógica en el controlador                                        | 6          |
| Cálculo de franjas duplicado                                                                              | 7          |
| Se puede reservar a horas fuera de la rejilla                                                             | 8          |
| Fechas y horas como texto                                                                                 | 7          |
| La hora de una reserva se interpreta en la zona horaria del servidor                                      | 8          |
| Disponibilidad de una pista que no existe: 500                                                            | 8          |
| Se pueden crear pistas que cierran antes de abrir, o en clubs que no existen                              | 5, 7, 8    |
| Cancelar = `DELETE`: se pierde el histórico                                                               | 15         |
| El HTML del correo lleva datos sin escapar (inyección de HTML)                                            | 13         |
| El correo va en la misma petición: si el SMTP falla, la reserva queda guardada y el cliente recibe un 500 | 13         |
| Solapes con `SELECT` + `INSERT`: carrera, caben dos reservas                                              | 14         |
| Las respuestas son las filas de la tabla (`club_id`, snake_case)                                          | 23         |
| Front: un `App.tsx`, URL del API hardcodeada, tipos a mano                                                | 4, 23      |
| Sin imagen desplegable ni CI                                                                              | 18, 19     |
| `console.log` suelto; cero observabilidad                                                                 | 20, 21     |

## Errores plantados en el MVC (capítulo 6)

El capítulo 6 ordena el código en capas y **a propósito** comete los errores
típicos de un MVC "de manual". Parece bien hecho: tiene carpetas, capas y tests.
Cada capítulo siguiente desmonta uno.

| Error                                         | Cómo se ve                                                                                      | Lo arregla |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| Un solo modelo `Booking` para todo            | Crear, listar, "mis reservas" y respuesta HTTP; `court_name?` y `club_name?` que a veces vienen | 11         |
| Modelo = fila de BD = JSON de la API          | Cambiar una columna rompe el contrato                                                           | 7          |
| Service gordo, modelo anémico                 | Todas las reglas en `BookingsService`; `Booking` es una bolsa de datos                          | 7, 8       |
| El service sabe de HTTP                       | Lanza `HttpException` con códigos de estado                                                     | 8          |
| El service manda el correo                    | Reservar y avisar van en el mismo método, y el service monta el HTML                            | 13         |
| El service de reservas consulta tablas ajenas | `BookingsService` lee `courts` y `clubs` con su propio SQL                                      | 9          |
| N+1 en "mis reservas"                         | Por cada reserva, una consulta para su pista y otra para su club                                | 11         |

## Tests: la pirámide crece con el código

Primero se cubre, después se refactoriza. Pero con todo metido en un controlador
pegado a `pg`, lo único que se puede testear sin atarse a la implementación es
el exterior: HTTP. Así que la pirámide empieza **invertida**: todo e2e, lento.

Cada refactor abre una capa nueva por debajo, y con ella se **recortan** e2e:

| Commit | Capa que aparece                                                 | Qué pasa con los e2e                                                         |
| ------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 3      | e2e de API (HTTP + Postgres y Mailpit reales)                    | Cubren cada caso de uso, cada regla y el correo                              |
| 7      | Unitarios de los value objects, sin mocks                        | No cambian: las reglas aún las orquesta el service                           |
| 8      | Unitarios de las entities, sin mocks                             | Las reglas pasan a unitarios; los e2e se quedan en un camino por caso de uso |
| 9      | Integración de los repositorios                                  | Lo de persistencia se prueba sin HTTP                                        |
| 10     | Unitarios de los casos de uso, con adaptadores en memoria        | No cambian                                                                   |
| 12     | Tests de los controllers: HTTP con la app en memoria, sin docker | Se quedan en un flujo: reservar                                              |
| 23     | e2e de navegador (Playwright)                                    | Dos caminos felices: reservar y cancelar                                     |

En cada uno de esos commits se apunta cuántos tests hay por capa y cuánto tarda
la suite: la gracia es ver que al final hay más tests y van más rápido.

## Iteraciones

**Fase 1. Así se trabajaba antes**

1. Correo de confirmación al reservar, metido como se metía un commit sin red:
   a mano, sin tests y mirando Mailpit

**Fase 2. Harness y red de seguridad**

2. mise, catálogo de pnpm, `tsconfig.base`, oxlint, oxfmt, Taskfile como puerta
   única, Makefile para docker y lefthook
3. e2e de API contra el controlador guarro (testcontainers: Postgres y Mailpit)

**Fase 3. Fronteras**

4. Paquete `contracts` en zod compartido front/back; validación en la frontera
5. Config tipada y migraciones con drizzle

**Fase 4. De capas a DDD**

6. MVC: modelos, controllers y services con el SQL dentro; con los errores de la tabla de arriba
7. Value objects: ningún primitivo en los modelos (ids, nombres, horas, fechas, franjas, horario); las reglas de cada valor dentro de su VO; unitarios sin mocks
8. Entities: `Club`, `Court` y `Booking` con named constructors y métodos de dominio, hechas de value objects; errores de dominio en vez de `HttpException`; `GLOSSARY.md`
9. Repositorios: puertos en el dominio y adaptadores con drizzle; tests de integración
10. Casos de uso en `application/`; dependency-cruiser vigila las capas

**Fase 5. CQRS, eventos y concurrencia**

11. Split de lectura y escritura: command handlers, query handlers con finders que leen directo a vistas, y un controller por caso de uso
12. La pirámide se da la vuelta: tests de los controllers con la app en memoria y un solo e2e, reservar
13. Eventos de dominio: un event bus en proceso; el command handler publica `CourtWasBookedEvent` y un event handler manda el correo
14. La carrera: un test concurrente que falla; el aggregate `CourtDay` (la agenda de una pista un día) con versión optimista cumple la regla de solapes también con reservas a la vez
15. Cancelar deja de borrar: la reserva queda cancelada en el histórico, libera su franja y se publica `BookingWasCancelledEvent`

**Fase 6. Lectura segregada**

16. El modelo de lectura en Mongo: proyecciones alimentadas por los eventos ("mis reservas" y la disponibilidad), consistencia eventual y reconstrucción desde Postgres
17. Caché con Redis: cache-aside sobre la disponibilidad, invalidada cuando cambia la agenda

**Fase 7. Operación**

18. Dockerizar backend y frontend (imágenes de producción)
19. CI/CD en GitHub Actions llamando a los mismos `task`; las imágenes se publican en GHCR
20. Logging estructurado con correlation id
21. Grafana + Loki + Tempo + Prometheus en el compose; OpenTelemetry (logs, trazas, métricas)
22. CI más rápida: caché, paralelismo, solo lo afectado

**Fase 8. Front (aparcado)**

23. TanStack Router y Query, cliente tipado desde `contracts`, carpetas por feature; Playwright
