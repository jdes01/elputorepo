from typing import Annotated
from src.contexts.core.domain.entities.employee import Employee
from src.contexts.core.infrastructure.container import CoreContainer
import typer

from src.contexts.shared.infrastructure.container import SharedContainer

shared_contaienr = SharedContainer()

container = CoreContainer(
    sqlalchemy_session=shared_contaienr.sqlalchemy_session,
    settings=shared_contaienr.settings,
)

repository = container.postgres_employee_repository()

app = typer.Typer()


@app.command()
def save_employee(
    name: Annotated[str, typer.Argument(help="Name of the employee")],
):
    employee = Employee(name=name)
    result = repository.save(employee)

    if isinstance(result, Exception):
        typer.echo(f"Error saving employee: {result}")
    else:
        typer.echo(f"Employee '{name}' saved")
