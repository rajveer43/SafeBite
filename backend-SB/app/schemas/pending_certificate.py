from datetime import date
from uuid import UUID

from pydantic import BaseModel


class PendingCertificateResponse(BaseModel):

    certificate_id: UUID

    restaurant: str

    certificate_type: str

    certificate_number: str

    uploaded_on: date

    status: str