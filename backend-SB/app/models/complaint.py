import uuid

from sqlalchemy import (
    UUID,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.enums.complaint_status import ComplaintStatus


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    customer_id = Column(
        UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False
    )

    restaurant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.restaurant_id"),
        nullable=False,
    )

    description = Column(Text, nullable=False)

    category = Column(String(100), nullable=True)

    status = Column(
        Enum(ComplaintStatus), nullable=False, default=ComplaintStatus.PENDING
    )

    evidence_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    restaurant = relationship("Restaurant", back_populates="complaints")

    customer = relationship("User", back_populates="complaints")
