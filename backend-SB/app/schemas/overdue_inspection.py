from datetime import date
from uuid import UUID

from pydantic import BaseModel


class OverdueInspectionResponse(BaseModel):

    restaurant_id: UUID

    restaurant: str

    owner: str

    last_inspection: date

    days_overdue: int