from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SafetyScoreResponse(BaseModel):
    score_id: UUID
    restaurant_id: UUID

    final_score: float

    inspection_weight: float
    complaint_weight: float
    certificate_weight: float
    feedback_weight: float

    generated_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )