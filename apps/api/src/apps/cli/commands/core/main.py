from typing import Annotated
from src.contexts.core.domain.entities.pizza import Pizza
from src.contexts.core.infrastructure.container import CoreContainer
import typer

from src.contexts.shared.infrastructure.container import SharedContainer

shared_contaienr = SharedContainer()

container = CoreContainer(
    sqlalchemy_session=shared_contaienr.sqlalchemy_session,
    settings=shared_contaienr.settings,
)

repository = container.postgres_pizza_repository()

app = typer.Typer()


@app.command()
def save_pizza(
    name: Annotated[str, typer.Argument(help="Name of the pizza")],
):
    pizza = Pizza(name=name)
    result = repository.save(pizza)

    if isinstance(result, Exception):
        typer.echo(f"Error saving pizza: {result}")
    else:
        typer.echo(f"Pizza '{name}' saved")
