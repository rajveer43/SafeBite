"""add verification status to users

Revision ID: cb538486307b
Revises: 4a73bc274dbf
Create Date: 2026-07-10 17:40:37.796191

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb538486307b'
down_revision: Union[str, Sequence[str], None] = '4a73bc274dbf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

verification_status = sa.Enum(
    "PENDING",
    "VERIFIED",
    "REJECTED",
    "SUSPENDED",
    name="verificationstatus",
)



def upgrade():

    verification_status.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.add_column(
        "users",
        sa.Column(
            "verification_status",
            verification_status,
            nullable=False,
            server_default="PENDING",
        ),
    )

    op.alter_column(
        "users",
        "verification_status",
        server_default=None,
    )


def downgrade():

    op.drop_column(
        "users",
        "verification_status",
    )

    verification_status.drop(
        op.get_bind(),
        checkfirst=True,
    )
