"""add pizza_id column to pizzas table

Revision ID: c0f20f5b0075
Revises: df244226696b
Create Date: 2025-09-29 23:58:06.461498

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = "c0f20f5b0075"
down_revision: Union[str, Sequence[str], None] = "df244226696b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1️⃣ Agregar columna como nullable
    op.add_column("pizzas", sa.Column("pizza_id", sa.String(), nullable=True))

    # 2️⃣ Rellenar filas existentes con UUID
    conn = op.get_bind()
    pizzas = conn.execute(sa.text("SELECT id FROM pizzas")).fetchall()
    for pizza in pizzas:
        conn.execute(
            sa.text("UPDATE pizzas SET pizza_id = :uuid WHERE id = :id"),
            {"uuid": str(uuid.uuid4()), "id": pizza.id},
        )

    # 3️⃣ Cambiar columna a NOT NULL
    op.alter_column("pizzas", "pizza_id", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("pizzas", "pizza_id")
