from sqlalchemy import Column, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class PizzaPostgresSchema(Base):
    __tablename__ = "pizzas"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
