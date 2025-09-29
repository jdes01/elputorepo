from dataclasses import dataclass
from sqlalchemy.orm import Session

from sqlalchemy.exc import SQLAlchemyError

from ...domain.repositories.pizza_repository import PizzaRepository
from ..schemas import PizzaPostgresSchema
from ...domain import Pizza

from logger.main import get_logger

logger = get_logger(__name__)

@dataclass
class PostgresPizzaRepository(PizzaRepository):
    session: Session

    def save(self, pizza: Pizza) -> None | Exception:
        try:
            with self.session.begin():
                new_pizza = PizzaPostgresSchema(name=pizza.name)
                self.session.add(new_pizza)

            self.session.refresh(new_pizza)
            
            logger = get_logger()
            logger.info(f"Pizza saved with ID: {new_pizza.id}")
            return None

        except SQLAlchemyError as e:
            return e
