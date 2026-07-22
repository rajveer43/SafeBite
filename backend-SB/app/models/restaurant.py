from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
)
import uuid

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.database.base import Base


class Restaurant(Base):
    __tablename__ = "restaurants"


    restaurant_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    owner_id = Column(
    UUID(as_uuid=True),
    ForeignKey("users.user_id"),
    nullable=False,
)

    name = Column(
        String(150),
        nullable=False
    )

    address = Column(
        String(500),
        nullable=False
    )

    location = Column(
    Geometry(
        "POINT",
        srid=4326,
        spatial_index=False
    ),
    nullable=False
    )

    contact_number = Column(
        String(20),
        nullable=False
    )

    status = Column(
        String(50),
        default="pending",
        nullable=False
    )

    safety_score = Column(
        Numeric(5, 2),
        default=0
    )

    assigned_inspector_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=True,
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

    owner = relationship(
        "User",
        back_populates="restaurants",
        foreign_keys=[owner_id],
    )

    assigned_inspector = relationship(
        "User",
        foreign_keys=[assigned_inspector_id],
    )

    certificates = relationship(
        "Certificate",
        back_populates="restaurant",
        cascade="all, delete-orphan"
    )

    inspections = relationship(
        "Inspection",
        back_populates="restaurant",
        cascade="all, delete-orphan"
    )

    complaints = relationship(
        "Complaint",
        back_populates="restaurant",
        cascade="all, delete-orphan"
    )

    safety_score_details = relationship(
        "SafetyScore",
        back_populates="restaurant",
        uselist=False,
        cascade="all, delete-orphan"
    )