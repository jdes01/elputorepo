from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.contexts.shared.infrastructure.sqlalchemy.connection import Base


class ShiftPostgresSchema(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True)
    shift_id = Column(String, nullable=False, unique=True)
    employee_id = Column(String, ForeignKey("employees.employee_id"), nullable=False)
    company_id = Column(String, ForeignKey("companies.company_id"), nullable=False)
    status = Column(String, nullable=False)
    start_datetime = Column(DateTime, nullable=True)
    end_datetime = Column(DateTime, nullable=True)

    employee = relationship("EmployeePostgresSchema", back_populates="shifts")
    company = relationship("CompanyPostgresSchema", back_populates="shifts")

    pauses = relationship(
        "ShiftPausePostgresSchema",
        back_populates="shift",
        cascade="all, delete-orphan",
        lazy="joined",
    )


class ShiftPausePostgresSchema(Base):
    __tablename__ = "shift_pauses"

    id = Column(Integer, primary_key=True)
    pause_id = Column(String, nullable=False, unique=True)
    shift_id = Column(String, ForeignKey("shifts.shift_id"), nullable=False)
    status = Column(String, nullable=False)
    creation_datetime = Column(DateTime, nullable=False)
    start_datetime = Column(DateTime, nullable=True)
    end_datetime = Column(DateTime, nullable=True)

    shift = relationship("ShiftPostgresSchema", back_populates="pauses")
