"""add assigned inspector to restaurants

Revision ID: e8f9a201b101
Revises: 26706c295fdf
Create Date: 2026-07-22 15:50:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "e8f9a201b101"
down_revision: Union[str, Sequence[str], None] = "26706c295fdf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "restaurants",
        sa.Column(
            "assigned_inspector_id",
            sa.UUID(),
            nullable=True,
        ),
    )
    op.create_foreign_key(
        "fk_restaurants_assigned_inspector_id_users",
        "restaurants",
        "users",
        ["assigned_inspector_id"],
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_restaurants_assigned_inspector_id_users",
        "restaurants",
        type_="foreignkey",
    )
    op.drop_column("restaurants", "assigned_inspector_id")
