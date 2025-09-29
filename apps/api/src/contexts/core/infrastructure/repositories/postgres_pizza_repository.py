from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from src.contexts.core.domain.entities.pizza import PizzaPrimitives, Pizza
from ...domain.repositories.pizza_repository import PizzaRepository
from ..schemas import PizzaPostgresSchema
from logger.main import get_logger

logger = get_logger(__name__)

@dataclass
class PostgresPizzaRepository(PizzaRepository):
    session: Session

    def save(self, pizza: Pizza) -> None | Exception:
        try:
            with self.session.begin():
                new_pizza = PizzaPostgresSchema(
                    pizza_id=pizza.id.value,
                    name=pizza.name.value,
                )
                self.session.add(new_pizza)
                self.session.flush()

                logger.info(
                    f"Pizza saved with DB ID: {new_pizza.id}, domain ID: {new_pizza.pizza_id}"
                )

                return None

        except SQLAlchemyError as e:
            logger.exception("Error saving pizza")
            return e

    def get_all(self) -> list[Pizza] | Exception:
        try:
            pizzas = self.session.query(PizzaPostgresSchema).all()
            return [
                Pizza.from_primitives(
                    PizzaPrimitives(
                        id=pizza.pizza_id,
                        name=pizza.name,
                    )
                )
                for pizza in pizzas
            ]
        except SQLAlchemyError as e:
            logger.exception("Error fetching pizzas")
            return e
