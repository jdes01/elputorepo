from sqlalchemy import Column, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class UserPostgresSchema(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
