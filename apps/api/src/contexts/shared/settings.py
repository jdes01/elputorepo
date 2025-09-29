from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    app_name: str = "PIZZERIA CHULERIA"
    postgres_uri: str = "postgresql://myuser:mypassword@db:5432/mydatabase"
