from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class InspectionCreate(BaseModel):
    restaurant_id: UUID
    inspection_date: date | datetime | str | None = None
    scheduled_date: date | datetime | str | None = None
    score: Decimal | None = None
    remarks: str | None = None
    notes: str | None = None
    parameters: dict | None = {}


class InspectionUpdate(BaseModel):
    inspection_date: date | datetime | str | None = None
    scheduled_date: date | datetime | str | None = None
    score: Decimal | None = None
    remarks: str | None = None
    notes: str | None = None
    parameters: dict | None = None
    status: str | None = None


class InspectionResponse(BaseModel):
    inspection_id: UUID
    id: UUID | None = None
    restaurant_id: UUID
    inspector_id: UUID
    inspection_date: date | None = None
    score: Decimal | None = None
    remarks: str | None = None
    parameters: dict | None = None
    created_at: datetime
    updated_at: datetime
    restaurant_name: str | None = None
    inspector_name: str | None = None
    status: str = "completed"
    scheduled_date: date | None = None
    completed_date: date | None = None
    notes: str | None = None

    model_config = {
        "from_attributes": True
    }
    