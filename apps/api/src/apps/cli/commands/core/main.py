from typing import Annotated

import typer

from src.contexts.core.domain.entities.event import Event
from src.contexts.core.infrastructure.container import CoreContainer
from src.contexts.shared.infrastructure.container import SharedContainer

shared_contaienr = SharedContainer()

container = CoreContainer(
    sqlalchemy_session=shared_contaienr.sqlalchemy_session,
    settings=shared_contaienr.settings,
)

repository = container.postgres_event_repository()

app = typer.Typer()


@app.command()
def save_event(
    name: Annotated[str, typer.Argument(help="Name of the event")],
):
    event = Event(name=name)
    result = repository.save(event)

    if isinstance(result, Exception):
        typer.echo(f"Error saving event: {result}")
    else:
        typer.echo(f"Event '{name}' saved")
