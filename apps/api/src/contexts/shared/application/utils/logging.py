"""Logging utilities for handlers."""

from typing import Any

from logger.main import get_logger

logger = get_logger(__name__)


def log_handler_start(handler_name: str, **kwargs: Any) -> None:
    """Log handler start in debug mode."""
    logger.debug(f"Processing {handler_name}", extra=kwargs)
