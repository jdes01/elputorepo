from sqlalchemy import Column, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class EmployeePostgresSchema(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    employee_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
