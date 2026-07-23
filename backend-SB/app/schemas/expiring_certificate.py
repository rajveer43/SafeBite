from datetime import date
from uuid import UUID

from pydantic import BaseModel


class ExpiringCertificateResponse(BaseModel):

    certificate_id: UUID

    restaurant: str

    certificate_type: str

    expiry_date: date

    days_left: int
