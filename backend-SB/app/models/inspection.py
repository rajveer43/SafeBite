import uuid

from sqlalchemy import (
    UUID,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base


class Inspection(Base):
    __tablename__ = "inspections"

    inspection_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    restaurant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.restaurant_id"),
        nullable=False,
    )

    inspector_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
    
    )

    inspection_date = Column(
        Date,
        nullable=True
    )

    score = Column(
        Numeric(5, 2),
        nullable=True
    )

    remarks = Column(
        Text,
        nullable=True
    )

    parameters = Column(
        JSONB,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    restaurant = relationship(
        "Restaurant",
        back_populates="inspections"
    )

    inspector = relationship(
        "User",
        back_populates="inspections"
    )