# logger/main.py
from loguru import logger as loguru_logger
from .context import request_id_var, execution_id_var
import sys


def configure_logger(level: str = "INFO"):
    loguru_logger.remove()
    loguru_logger.add(
        sys.stdout,
        level=level,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "req={extra[request_id]} exec={extra[execution_id]} | "
        "{message}",
    )


def get_logger(name: str = "app"):  # sin tipo explícito
    return loguru_logger.bind(
        request_id=request_id_var.get(), execution_id=execution_id_var.get(), name=name
    )

