import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.enums.notification_type import NotificationType


class Notification(Base):

    __tablename__ = "notifications"

    notification_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
    )

    title = Column(
        String(200),
        nullable=False,
    )

    message = Column(
        String(500),
        nullable=False,
    )

    type = Column(
        Enum(NotificationType),
        nullable=False,
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user = relationship(
        "User",
        back_populates="notifications",
    )
