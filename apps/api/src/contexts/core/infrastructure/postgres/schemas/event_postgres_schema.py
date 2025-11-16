from dataclasses import dataclass
from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column

from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


@dataclass
class EventPostgresSchema(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(nullable=False, unique=True)
    name: Mapped[str] = mapped_column(nullable=False)
    capacity: Mapped[int] = mapped_column(nullable=False)
    deleted_at: Mapped[datetime] = mapped_column(default=None, nullable=True)
