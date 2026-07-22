from app.enums.user_role import UserRole
import uuid

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    String,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.enums.verification_status import VerificationStatus
from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    name = Column(
        String(100), 
        nullable=False
        )

    email = Column(
        String(150), 
        unique=True, 
        nullable=False, 
        index=True
        )

    password_hash = Column(
        String(255), 
        nullable=False
        )

    role = Column(
        Enum(
            UserRole,
            values_callable=lambda enum: [e.value for e in enum],
            name="userrole",
        ),
        nullable=False,
    )

    verification_status = Column(
        Enum(
            VerificationStatus,
            values_callable=lambda enum: [e.value for e in enum],
            name="verificationstatus",
        ),
        nullable=False,
        default=VerificationStatus.PENDING,
    )


    phone_number = Column(
        String(20), 
        nullable=False
        )

    is_active = Column(
        Boolean, 
        nullable = False, 
        default=True
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

    restaurants = relationship(
        "Restaurant",
        back_populates="owner",
        foreign_keys="[Restaurant.owner_id]",
    )

    inspections = relationship(
    "Inspection",
    back_populates="inspector"
    )

    complaints = relationship(
    "Complaint",
    back_populates="customer"
    )

    notifications = relationship(
    "Notification",
    back_populates="user",
    cascade="all, delete-orphan",
    )