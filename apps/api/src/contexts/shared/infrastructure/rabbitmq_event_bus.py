import json
from datetime import datetime
from typing import Any

import pika
from logger.main import get_logger
from pika.adapters.blocking_connection import BlockingChannel
from pika.exchange_type import ExchangeType

from src.contexts.shared.domain.domain_event import DomainEvent
from src.contexts.shared.domain.event_bus import EventBus
from src.contexts.shared.domain.event_handler import EventHandler
from src.contexts.shared.settings import Settings

logger = get_logger(__name__)


class RabbitMQEventBus(EventBus):
    EXCHANGE_NAME = "domain_events"
    EXCHANGE_TYPE = "topic"

    def __init__(self, settings: Settings):
        self.settings = settings
        self._connection: pika.BlockingConnection | None = None
        self._channel: BlockingChannel | None = None
        self._ensure_connection()

    def _ensure_connection(self) -> None:
        if self._connection is None or self._connection.is_closed:
            try:
                self._connection = pika.BlockingConnection(pika.URLParameters(self.settings.rabbitmq_uri))
                self._channel = self._connection.channel()
                self._channel.exchange_declare(exchange=self.EXCHANGE_NAME, exchange_type=ExchangeType["topic"], durable=True)
                logger.info("Connected to RabbitMQ")
            except Exception as e:
                logger.error("Error connecting to RabbitMQ", extra={"error": str(e)}, exc_info=True)
                raise

    def publish(self, events: list[DomainEvent]) -> None:
        if not events:
            return

        for event in events:
            try:
                self._ensure_connection()

                event_type = type(event).__name__
                # Determine prefix based on event type
                if event_type.startswith("User"):
                    prefix = "users"
                elif event_type.startswith("Event"):
                    prefix = "events"
                else:
                    prefix = "events"  # default

                routing_key = f"{prefix}.{event_type.lower()}"

                event_data = self._serialize_event(event)
                message_body = json.dumps(event_data, default=self._json_serializer)

                if self._channel and not self._channel.is_closed:
                    self._channel.basic_publish(
                        exchange=self.EXCHANGE_NAME,
                        routing_key=routing_key,
                        body=message_body,
                        properties=pika.BasicProperties(
                            delivery_mode=2,  # Make message persistent
                            content_type="application/json",
                        ),
                    )
                    logger.debug(
                        "Event published to RabbitMQ",
                        extra={"event_type": event_type, "routing_key": routing_key},
                    )
                else:
                    # Reconnect if channel is closed
                    self._ensure_connection()
                    if self._channel:
                        self._channel.basic_publish(
                            exchange=self.EXCHANGE_NAME,
                            routing_key=routing_key,
                            body=message_body,
                            properties=pika.BasicProperties(
                                delivery_mode=2,
                                content_type="application/json",
                            ),
                        )
                        logger.debug(
                            "Event published to RabbitMQ (after reconnect)",
                            extra={"event_type": event_type, "routing_key": routing_key},
                        )
            except Exception as e:
                logger.error(
                    "Error publishing event to RabbitMQ",
                    extra={"event_type": type(event).__name__, "error": str(e)},
                    exc_info=True,
                )
                # Try to reconnect for next event
                try:
                    self._connection = None
                    self._channel = None
                except Exception:
                    pass

    def _serialize_event(self, event: DomainEvent) -> dict[str, Any]:
        event_dict: dict[str, Any] = {}
        for key, value in event.__dict__.items():
            if hasattr(value, "value"):
                event_dict[key] = value.value
            elif isinstance(value, str | int | float | bool | type(None)):
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
