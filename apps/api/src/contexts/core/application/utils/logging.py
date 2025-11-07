"""Logging utilities for handlers."""

from typing import Any

from logger.main import get_logger

logger = get_logger(__name__)


def log_handler_start(handler_name: str, **kwargs: Any) -> None:
    """Log handler start in debug mode."""
    logger.debug(f"Processing {handler_name}", extra=kwargs)


def log_handler_success(handler_name: str, **kwargs: Any) -> None:
    """Log handler success in info mode."""
    logger.info(f"{handler_name} completed successfully", extra=kwargs)


def log_handler_error(handler_name: str, error: Exception, **kwargs: Any) -> None:
    """Log handler error."""
    logger.error(
        f"Error in {handler_name}",
        extra={
            **kwargs,
            "error": str(error),
            "error_type": type(error).__name__,
        },
    )
