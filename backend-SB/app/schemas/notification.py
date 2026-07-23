from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.enums.notification_type import NotificationType


class NotificationResponse(BaseModel):

    notification_id: UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UnreadCountResponse(BaseModel):

    count: int
