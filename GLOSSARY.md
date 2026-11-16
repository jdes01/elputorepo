# Glosario

El lenguaje del dominio, en español, y su nombre en el código. Si una palabra
nueva aparece en una conversación sobre reservas, va aquí antes que al código.

| Término        | En el código           | Qué es                                                                                                                                                              |
| -------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Club           | `Club`                 | Quien tiene pistas. Se da de alta con un nombre.                                                                                                                    |
| Pista          | `Court`                | Donde se juega. Es de un club y tiene un horario.                                                                                                                   |
| Horario        | `OpeningHours`         | Cuándo abre y cuándo cierra una pista, el mismo día. Abre antes de cerrar.                                                                                          |
| Franja         | `TimeSlot`             | 90 minutos de juego desde una hora de inicio.                                                                                                                       |
| Rejilla        | `OpeningHours.slots()` | Las franjas de un día, seguidas desde que abre la pista. Solo se reserva en ellas: si abre a las 09:00, a las 10:30 sí, a las 10:00 no.                             |
| Disponibilidad | `Court.availability()` | La rejilla de un día con cada franja libre u ocupada.                                                                                                               |
| Reserva        | `Booking`              | Una franja de una pista, un día, para un usuario.                                                                                                                   |
| Reservar       | `CourtDay.book()`      | Ocupar una franja libre de la agenda del día. Nunca en el pasado.                                                                                                   |
| Agenda del día | `CourtDay`             | La rejilla de una pista en un día, con cada franja libre u ocupada por su reserva. Es por donde se reserva y se cancela, también cuando llegan peticiones a la vez. |
| Cancelar       | `CourtDay.cancel()`    | Liberar la franja. La reserva no se borra: se queda, marcada como cancelada. Solo quien reservó, y con 24 h de antelación como mínimo.                              |
| Usuario        | `UserId`               | Quien reserva. Se identifica por su email.                                                                                                                          |
| Hora del club  | `CLUBS_TIME_ZONE`      | Las horas de las reservas son de Madrid, esté donde esté el servidor.                                                                                               |
