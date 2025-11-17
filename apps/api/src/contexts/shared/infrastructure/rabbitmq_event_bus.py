import json
import time
from datetime import datetime
from typing import Any

import pika
from logger.main import get_logger
from pika.adapters.blocking_connection import BlockingChannel
from pika.exceptions import AMQPConnectionError, ConnectionClosed, StreamLostError
from pika.exchange_type import ExchangeType

from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.domain.event_handler import EventHandler
from src.contexts.shared.settings import Settings

logger = get_logger(__name__)


class RabbitMQEventBus(EventBus):
    EXCHANGE_NAME = "domain_events"
    EXCHANGE_TYPE = "topic"
    HEARTBEAT = 30  # segundos

    def __init__(self, settings: Settings):
        self.settings = settings
        self._connection: pika.BlockingConnection | None = None
        self._channel: BlockingChannel | None = None
        self._ensure_connection()

    def _ensure_connection(self) -> None:
        if self._connection is None or self._connection.is_closed:
            try:
                params = pika.URLParameters(self.settings.rabbitmq_uri)
                params.heartbeat = self.HEARTBEAT
                self._connection = pika.BlockingConnection(params)
                self._channel = self._connection.channel()
                self._channel.exchange_declare(
                    exchange=self.EXCHANGE_NAME,
                    exchange_type=ExchangeType.topic,
                    durable=True,
                )
                logger.info("Connected to RabbitMQ")
            except AMQPConnectionError as e:
                logger.error("Error connecting to RabbitMQ", extra={"error": str(e)}, exc_info=True)
                raise

    async def publish(self, events: list[DomainEvent]) -> None:
        if not events:
            return

        for event in events:
            await self._publish_single_event(event)

    async def _publish_single_event(self, event: DomainEvent) -> None:
        routing_key = getattr(event, "EVENT_NAME", type(event).__name__.lower())
        event_data = self._serialize_event(event)
        message_body = json.dumps(event_data, default=self._json_serializer)

        max_retries = 3
        for attempt in range(max_retries):
            try:
                self._ensure_connection()
                if self._channel is None or self._channel.is_closed:
                    raise ConnectionClosed()

                self._channel.basic_publish(
                    exchange=self.EXCHANGE_NAME,
                    routing_key=routing_key,
                    body=message_body,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # Persistente
                        content_type="application/json",
                    ),
                )
                logger.debug(
                    "Event published to RabbitMQ",
                    extra={"routing_key": routing_key},
                )
                break  # salió bien, no más reintentos
            except (StreamLostError, ConnectionClosed, AMQPConnectionError) as e:
                logger.warning(
                    f"RabbitMQ connection lost while publishing. Retry {attempt + 1}/{max_retries}",
                    extra={"error": str(e), "event": routing_key},
                    exc_info=True,
                )
                # Forzar reconexión
                self._connection = None
                self._channel = None
                time.sleep(1)  # pequeño backoff antes de reconectar
            except Exception as e:
                logger.error(
                    "Unexpected error publishing event",
                    extra={"error": str(e), "event": routing_key},
                    exc_info=True,
                )
                break  # no retry para errores inesperados

    def _serialize_event(self, event: DomainEvent) -> dict[str, Any]:
        event_dict: dict[str, Any] = {}
        for key, value in event.__dict__.items():
            if hasattr(value, "value"):
                event_dict[key] = value.value
            elif isinstance(value, (str, int, float, bool, type(None))):
                event_dict[key] = value
            else:
                event_dict[key] = str(value)
        return event_dict

    def _json_serializer(self, obj: Any) -> str:
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    def subscribe(self, event_type: type[DomainEvent], handler: EventHandler[DomainEvent]) -> None:
        raise NotImplementedError("RabbitMQEventBus does not support subscriptions")
