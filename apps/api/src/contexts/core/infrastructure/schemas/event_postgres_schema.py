from sqlalchemy import Column, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class EventPostgresSchema(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    event_id = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
