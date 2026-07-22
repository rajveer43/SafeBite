from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ActivityResponse(BaseModel):

    activity_id: UUID

    activity_type: str

    message: str

    actor_id: UUID | None

    entity_id: UUID | None

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )