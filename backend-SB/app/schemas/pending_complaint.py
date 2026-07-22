from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PendingComplaintResponse(BaseModel):

    complaint_id: UUID

    customer: str

    restaurant: str

    category: str | None

    status: str

    created_at: datetime