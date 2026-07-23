import uuid

from sqlalchemy import (
    Column,
    DateTime,
    String,
)

from sqlalchemy.sql import func

from sqlalchemy.dialects.postgresql import UUID

from app.database.base import Base


class ActivityLog(Base):

    __tablename__ = "activity_logs"

    activity_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    activity_type = Column(
        String(100),
        nullable=False,
    )

    message = Column(
        String(500),
        nullable=False,
    )

    actor_id = Column(
        UUID(as_uuid=True),
        nullable=True,
    )

    entity_id = Column(
        UUID(as_uuid=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
