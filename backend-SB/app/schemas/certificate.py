from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.enums.certificate_status import CertificateStatus
from app.enums.certificate_type import CertificateType


class CertificateCreate(BaseModel):
    restaurant_id: UUID
    certificate_type: CertificateType
    certificate_number: str
    issuing_authority: str
    issue_date: date
    expiry_date: date
    document_url: str | None = None


class CertificateUpdate(BaseModel):
    certificate_type: CertificateType
    certificate_number: str
    issuing_authority: str
    issue_date: date
    expiry_date: date
    status: CertificateStatus
    document_url: str | None = None


class CertificateResponse(BaseModel):
    certificate_id: UUID
    restaurant_id: UUID
    certificate_type: CertificateType
    certificate_number: str
    issuing_authority: str
    issue_date: date
    expiry_date: date
    status: CertificateStatus
    document_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
