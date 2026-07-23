from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PendingOwnerResponse(BaseModel):

    user_id: UUID

    name: str

    email: str

    phone_number: str

    registered_at: datetime
