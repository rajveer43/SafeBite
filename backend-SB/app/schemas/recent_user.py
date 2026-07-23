from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RecentUserResponse(BaseModel):

    user_id: UUID

    name: str

    email: str

    role: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
