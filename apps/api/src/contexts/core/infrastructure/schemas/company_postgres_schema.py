from sqlalchemy import Column, Integer, String
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base
from sqlalchemy.orm import relationship


class CompanyPostgresSchema(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    company_id = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)

    employees = relationship(
        "EmployeePostgresSchema",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    shifts = relationship(
        "ShiftPostgresSchema",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="joined",
    )
