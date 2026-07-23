from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.enums.complaint_status import ComplaintStatus


class ComplaintCreate(BaseModel):
    restaurant_id: UUID
    description: str
    category: str | None = None
    evidence_url: str | None = None
    title: str | None = None
    priority: str | None = None


class ComplaintUpdate(BaseModel):
    status: ComplaintStatus


class ComplaintResponse(BaseModel):
    complaint_id: UUID
    customer_id: UUID
    restaurant_id: UUID
    description: str
    category: str | None
    status: ComplaintStatus
    evidence_url: str | None
    created_at: datetime
    updated_at: datetime
    restaurant_name: str | None = None

    model_config = {"from_attributes": True}
