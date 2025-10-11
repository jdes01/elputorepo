import pytest
from src.contexts.core.domain.entities.employee import Employee
from src.contexts.core.domain.value_objects import EmployeeId, EmployeeName, CompanyId
from src.contexts.core.domain.value_objects.company_name import CompanyName
from src.contexts.core.infrastructure.repositories.postgres_employee_repository import (
    PostgresEmployeeRepository,
)
from sqlalchemy.orm import Session

from src.contexts.core.infrastructure.schemas.company_postgres_schema import (
    CompanyPostgresSchema,
)
from sqlalchemy.exc import SQLAlchemyError


@pytest.fixture
def repo(postgres_session: Session) -> PostgresEmployeeRepository:
    return PostgresEmployeeRepository(session=postgres_session)


@pytest.fixture
def company(postgres_session: Session) -> CompanyPostgresSchema:
    company_id = CompanyId.generate()
    company_name = CompanyName("ACME Inc")
    company_schema = CompanyPostgresSchema(
        company_id=company_id.value, name=company_name.value
    )
    postgres_session.add(company_schema)
    postgres_session.commit()
    return company_schema


@pytest.fixture
def employee(company: CompanyPostgresSchema) -> Employee:
    return Employee.create(
        id=EmployeeId.generate(),
        name=EmployeeName("Alice"),
        company_id=CompanyId(company.company_id),  # type: ignore
    )


@pytest.mark.integration
def test_save_and_get_all_employees(postgres_session: Session):
    # Arrange
    company_id = CompanyId.generate()
    company_name = CompanyName("ACME Inc")

    company_schema = CompanyPostgresSchema(
        company_id=company_id.value, name=company_name.value
    )

    postgres_session.add(company_schema)
    postgres_session.commit()

    repo = PostgresEmployeeRepository(session=postgres_session)
    employee = Employee.create(
        id=EmployeeId.generate(),
        name=EmployeeName("Alice"),
        company_id=company_id,
    )

    # Act
    result = repo.save(employee)
    assert result is None, "Expected save() to return None on success"

    employees = repo.get_all()

    # Assert
    assert isinstance(employees, list)
    assert len(employees) == 1
    loaded = employees[0]
    assert loaded.id == employee.id
    assert loaded.name == employee.name
    assert loaded.company_id == employee.company_id


@pytest.mark.integration
def test_save_handles_sqlalchemy_error_gracefully(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEmployeeRepository(session=postgres_session)
    employee = Employee.create(
        id=EmployeeId.generate(),
        name=EmployeeName("Bob"),
        company_id=CompanyId.generate(),
    )

    def fail_add(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.save(employee)

    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)


@pytest.mark.integration
def test_save_returns_exception_without_raising(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEmployeeRepository(session=postgres_session)
    employee = Employee.create(
        id=EmployeeId.generate(),
        name=EmployeeName("Charlie"),
        company_id=CompanyId.generate(),
    )

    def fail_add(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "add", fail_add)  # type: ignore

    result = repo.save(employee)

    # No debería lanzarse, sino devolverse
    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)


@pytest.mark.integration
def test_get_all_handles_sqlalchemy_error_gracefully(
    monkeypatch: pytest.MonkeyPatch, postgres_session: Session
):
    repo = PostgresEmployeeRepository(session=postgres_session)

    def fail_query(_):
        raise SQLAlchemyError("Simulated DB error")

    monkeypatch.setattr(postgres_session, "query", fail_query)  # type: ignore

    result = repo.get_all()

    assert isinstance(result, SQLAlchemyError)
    assert "Simulated DB error" in str(result)
