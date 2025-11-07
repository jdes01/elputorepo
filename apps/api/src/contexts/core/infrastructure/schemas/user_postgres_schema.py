from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class UserPostgresSchema(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

