import sys
import typer

from .commands.core.main import app as core_cli

sys.path.append(".")

app = typer.Typer()

app.add_typer(core_cli, name="core", help="Core commands")

if __name__ == "__main__":
    app()
