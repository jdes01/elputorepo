from loguru import logger as loguru_logger
from .context import request_id_var, execution_id_var
import sys
import os
import json


def _get_message_color_ansi(level_name: str) -> tuple[str, str]:
    """Get ANSI color codes for message based on log level. Returns (start_code, end_code)."""
    color_map = {
        "TRACE": ("\033[36m", "\033[0m"),  # Cyan
        "DEBUG": ("\033[36m", "\033[0m"),  # Cyan
        "INFO": ("\033[32m", "\033[0m"),  # Green
        "SUCCESS": ("\033[32m", "\033[0m"),  # Green
        "WARNING": ("\033[33m", "\033[0m"),  # Yellow
        "ERROR": ("\033[31m", "\033[0m"),  # Red
        "CRITICAL": ("\033[31m\033[1m", "\033[0m"),  # Red Bold
    }
    return color_map.get(level_name, ("", ""))


def _create_sink_with_extra(format_str):
    """Create a custom sink that formats extra fields."""

    def sink(message):
        record = message.record
        # Get extra fields excluding request_id, execution_id, name
        extra = {
            k: v
            for k, v in record["extra"].items()
            if k not in ("request_id", "execution_id", "name")
        }
        extra_str = ""
        if extra:
            # Format as JSON without the "extra" wrapper
            extra_str = f" | {json.dumps(extra, ensure_ascii=False)}"

        # Use loguru's built-in formatting
        formatted = message.format(record)
        # Append extra fields (remove newline from formatted, add it after extra_str)
        formatted_clean = formatted.rstrip("\n")
        sys.stdout.write(formatted_clean + extra_str + "\n")
        sys.stdout.flush()

    return sink


def configure_logger(level: str = "INFO"):
    loguru_logger.remove()

    # Check if we're in local environment
    is_local = os.getenv("ENVIRONMENT", "local").lower() in (
        "local",
        "dev",
        "development",
    )

    if is_local:
        # Local: Clean, beautiful logs with extra fields
        # Handler for request.start, request.end, and DEBUG logs (white, with extra)
        format_str = (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | {level: <8} | {message}"
        )
        loguru_logger.add(
            _create_sink_with_extra(format_str),
            level=level,
            colorize=True,
            format=format_str,
            filter=lambda record: (
                record["message"].startswith("request.start")
                or record["message"].startswith("request.end")
                or record["level"].name == "DEBUG"
            ),
        )

        # Handler for other logs (colored levels and messages, with extra)
        # Create format string with colored message based on level
        def create_colored_format(record):
            level_name = record["level"].name
            msg_color = _get_message_color(level_name)
            if msg_color:
                # Remove < > to get color name for closing tag
                color_name = msg_color.replace("<", "").replace(">", "")
                return f"<green>{{time:YYYY-MM-DD HH:mm:ss.SSS}}</green> | <level>{{level: <8}}</level> | {msg_color}{{message}}</{color_name}>"
            else:
                return "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | {message}"

        def sink_with_colored_message(message):
            record = message.record
            # Get extra fields excluding request_id, execution_id, name
            extra = {
                k: v
                for k, v in record["extra"].items()
                if k not in ("request_id", "execution_id", "name")
            }
            extra_str = ""
            if extra:
                extra_str = f" | {json.dumps(extra, ensure_ascii=False)}"

            # Format time (green)
            time_str = record["time"].strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            time_colored = f"\033[32m{time_str}\033[0m"

            # Get level name and format with color
            level_name = record["level"].name
            level_colored = f"\033[1m{level_name: <8}\033[0m"  # Bold for level

            # Get message color based on level
            msg_start, msg_end = _get_message_color_ansi(level_name)
            message_text = record["message"]
            colored_message = f"{msg_start}{message_text}{msg_end}"

            # Build final formatted string
            formatted = f"{time_colored} | {level_colored} | {colored_message}"

            sys.stdout.write(formatted + extra_str + "\n")
            sys.stdout.flush()

        loguru_logger.add(
            sink_with_colored_message,
            level=level,
            colorize=True,
            filter=lambda record: not (
                record["message"].startswith("request.start")
                or record["message"].startswith("request.end")
                or record["level"].name == "DEBUG"
            ),
        )
    else:
        # Production: Structured logs with all information
        # Handler for request.start, request.end, and DEBUG logs (white, structured)
        format_str = "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | {level: <8} | <cyan>{line}</cyan> | req={extra[request_id]} exec={extra[execution_id]} | {message}"
        loguru_logger.add(
            _create_sink_with_extra(format_str),
            level=level,
            colorize=True,
            format=format_str,
            filter=lambda record: (
                record["message"].startswith("request.start")
                or record["message"].startswith("request.end")
                or record["level"].name == "DEBUG"
            ),
        )

        # Handler for other logs (colored levels, structured)
        format_str = "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{line}</cyan> | req={extra[request_id]} exec={extra[execution_id]} | {message}"
        loguru_logger.add(
            _create_sink_with_extra(format_str),
            level=level,
            colorize=True,
            format=format_str,
            filter=lambda record: not (
                record["message"].startswith("request.start")
                or record["message"].startswith("request.end")
                or record["level"].name == "DEBUG"
            ),
        )


def get_logger(name: str = "app"):  # sin tipo explícito
    return loguru_logger.bind(
        request_id=request_id_var.get(), execution_id=execution_id_var.get(), name=name
    )
