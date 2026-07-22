import uuid

from sqlalchemy import (
    UUID,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    String,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.enums.certificate_status import CertificateStatus
from app.enums.certificate_type import CertificateType


class Certificate(Base):
    __tablename__ = "certificates"

    certificate_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    restaurant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("restaurants.restaurant_id"),
        nullable=False,
    )

    certificate_type = Column(
        Enum(CertificateType),
        nullable=False,
    )

    certificate_number = Column(
        String(100),
        nullable=False,
    )

    issuing_authority = Column(
        String(200),
        nullable=False,
    )

    issue_date = Column(
        Date,
        nullable=False,
    )

    expiry_date = Column(
        Date,
        nullable=False,
    )

    status = Column(
        Enum(CertificateStatus),
        nullable=False,
        default=CertificateStatus.PENDING,
    )

    document_url = Column(
        String(500),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    restaurant = relationship(
        "Restaurant",
        back_populates="certificates",
    )