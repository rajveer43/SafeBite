"""add_status_to_restaurants

Revision ID: fd70bfa6bd6c
Revises: e8f9a201b101
Create Date: 2026-07-22 18:20:32.425488

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd70bfa6bd6c'
down_revision: Union[str, Sequence[str], None] = 'e8f9a201b101'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "restaurants",
        sa.Column(
            "status",
            sa.String(length=50),
            server_default="pending",
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("restaurants", "status")

