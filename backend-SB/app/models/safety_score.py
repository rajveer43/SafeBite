import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base
from sqlalchemy.dialects.postgresql import UUID

class SafetyScore(Base):
    __tablename__ = "safety_scores"

    score_id = Column(
     UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    restaurant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.restaurant_id"),
        nullable=False,
        unique=True
    )

    final_score = Column(
        Numeric(5, 2),
        nullable=False
    )

    inspection_weight = Column(
        Numeric(5, 2),
        nullable=False
    )

    complaint_weight = Column(
        Numeric(5, 2),
        nullable=False
    )

    certificate_weight = Column(
        Numeric(5, 2),
        nullable=False
    )

    feedback_weight = Column(
        Numeric(5, 2),
        nullable=False
    )

    generated_at = Column(
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
    back_populates="safety_score_details"
    )