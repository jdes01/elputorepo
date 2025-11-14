from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column

from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class UserPostgresSchema(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(nullable=False, unique=True)
    email: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now, nullable=False)
