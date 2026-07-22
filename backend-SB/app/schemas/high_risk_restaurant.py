from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class HighRiskRestaurantResponse(BaseModel):

    restaurant_id: UUID

    restaurant_name: str

    owner_name: str

    safety_score: Decimal

    pending_complaints: int

    expired_certificates: int