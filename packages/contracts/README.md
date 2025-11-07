# Contracts

Shared event contracts between microservices.

## Installation

### For TypeScript/Node.js (tickets microservice):
```bash
npm install @elputorepo/contracts
```

### For Python (api microservice):
```bash
uv add contracts
```

## Usage

### TypeScript
```typescript
import { EventCreatedSchema, EventCreated, extractEventId, extractCapacity } from '@elputorepo/contracts';

const event: EventCreated = EventCreatedSchema.parse(message);
const eventId = extractEventId(event);
const capacity = extractCapacity(event);
```

### Python
```python
from contracts import EventCreated

event = EventCreated.model_validate(message)
event_id = event.event_id_value
capacity = event.capacity_value
```

## Structure

- `src/index.ts` - TypeScript contracts (Zod schemas)
- `src/contracts/__init__.py` - Python contracts (Pydantic models)

Both versions define the same contracts:
- `EventCreated`
- `EventDeleted`
- `UserCreated`
- `TicketAcquired`
