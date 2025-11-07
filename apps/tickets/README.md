# Tickets Service

Microservicio de gestión de tickets que escucha eventos de creación y eliminación de eventos.

## Estructura

- `src/apps/subscriptions/` - Módulo de suscripciones a eventos
- `src/contexts/ticketing/` - Dominio, aplicación e infraestructura del contexto de ticketing
- `src/infrastructure/` - Infraestructura compartida (RabbitMQ, etc.)

## Configuración

Variables de entorno:
- `MONGODB_URI`: URI de conexión a MongoDB
- `RABBITMQ_URI`: URI de conexión a RabbitMQ

## Desarrollo

```bash
npm install
npm run start:dev
```

