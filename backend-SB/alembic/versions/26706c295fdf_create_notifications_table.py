"""create notifications table

Revision ID: 26706c295fdf
Revises: cb538486307b
Create Date: 2026-07-14 11:13:26.570123

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

#

# revision identifiers, used by Alembic.
revision: str = "26706c295fdf"
down_revision: Union[str, Sequence[str], None] = "cb538486307b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # notification_type.create(
    #     op.get_bind(),
    #     checkfirst=True,
    # )

    op.create_table(
        "notifications",
        sa.Column(
            "notification_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.UUID(),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(200),
            nullable=False,
        ),
        sa.Column(
            "message",
            sa.String(500),
            nullable=False,
        ),
        sa.Column(
            "type",
            postgresql.ENUM(
                "INFO",
                "SUCCESS",
                "WARNING",
                "ERROR",
                name="notificationtype",
                create_type=True,
            ),
            nullable=False,
        ),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.user_id"],
        ),
        sa.PrimaryKeyConstraint(
            "notification_id",
        ),
    )
    # ### end Alembic commands ###


def downgrade() -> None:

    op.drop_table(
        "notifications",
    )
    op.execute("DROP TYPE IF EXISTS notificationtype")

    # notification_type.drop(
    #     op.get_bind(),
    #     checkfirst=True,
    # )
    # ### end Alembic commands ###
