from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from src.contexts.core.domain.entities.company import Company, CompanyPrimitives
from src.contexts.core.domain.value_objects.company_id import CompanyId
from src.contexts.core.infrastructure.schemas.company_postgres_schema import (
    CompanyPostgresSchema,
)
from src.contexts.core.domain.repositories.company_repository import CompanyRepository
from logger.main import get_logger

logger = get_logger(__name__)


@dataclass
class PostgresCompanyRepository(CompanyRepository):
    session: Session

    def save(self, company: Company) -> None | Exception:
        try:
            with self.session.begin():
                existing = (
                    self.session.query(CompanyPostgresSchema)
                    .filter_by(company_id=company.id.value)
                    .one_or_none()
                )

                if existing:
                    existing.name = company.name.value  # type: ignore
                else:
                    new_company = CompanyPostgresSchema(
                        company_id=company.id.value,
                        name=company.name.value,
                    )
                    self.session.add(new_company)

                logger.info(
                    f"Company saved/updated: {company.id.value} ({company.name.value})"
                )

                return None

        except SQLAlchemyError as e:
            logger.exception("Error saving company")
            self.session.rollback()
            return e

    def get(self, company_id: CompanyId) -> Company | None | Exception:
        try:
            company = (
                self.session.query(CompanyPostgresSchema)
                .filter_by(company_id=company_id.value)
                .one_or_none()
            )

            if company is None:
                return None

            return Company.from_primitives(
                CompanyPrimitives(
                    id=company.company_id,  # type: ignore
                    name=company.name,  # type: ignore
                )
            )

        except SQLAlchemyError as e:
            logger.exception("Error fetching company")
            return e
