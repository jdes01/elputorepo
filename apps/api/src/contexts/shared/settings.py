from enum import StrEnum

from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    DEVELOPMENT = "DEVELOPMENT"
    TEST = "TEST"
    PRODUCTION = "PRODUCTION"


class LogLevel(StrEnum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    app_name: str = "PIZZERIA CHULERIA"
    postgres_uri: str = "postgresql://myuser:mypassword@elputorepo-api-postgres:5432/mydatabase"
    mongodb_uri: str = "mongodb://elputorepo-api-mongodb:27017/database"
    mongodb_database_name: str = "database"
    rabbitmq_uri: str = "amqp://guest:guest@rabbitmq:5672/"
    environment: str = Environment.DEVELOPMENT
    log_level: str = LogLevel.DEBUG
