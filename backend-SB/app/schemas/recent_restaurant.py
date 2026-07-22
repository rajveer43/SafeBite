from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RecentRestaurantResponse(BaseModel):

    restaurant_id: UUID

    name: str

    owner: str

    contact_number: str

    safety_score: Decimal | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )