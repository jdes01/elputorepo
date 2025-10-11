from sqlalchemy import Column, ForeignKey, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base
from sqlalchemy.orm import relationship


class EmployeePostgresSchema(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True)
    employee_id = Column(String, nullable=False, unique=True)
    company_id = Column(String, ForeignKey("companies.company_id"), nullable=False)
    name = Column(String, nullable=False)

    company = relationship("CompanyPostgresSchema", back_populates="employees")

    shifts = relationship(
        "ShiftPostgresSchema",
        back_populates="employee",
        cascade="all, delete-orphan",
        lazy="joined",
    )