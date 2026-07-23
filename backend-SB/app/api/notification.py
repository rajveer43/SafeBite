from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    UnreadCountResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


@router.get(
    "",
    response_model=list[NotificationResponse],
)
def get_notifications(
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    return NotificationService(db).get_notifications(
        current_user.user_id,
    )


@router.patch(
    "/{notification_id}/read",
)
def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    return NotificationService(db).mark_as_read(
        notification_id,
        current_user.user_id,
    )


@router.patch(
    "/read-all",
)
def mark_all_read(
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    NotificationService(db).mark_all_as_read(
        current_user.user_id,
    )

    return {"message": "All notifications marked as read."}


@router.get(
    "/unread-count",
    response_model=UnreadCountResponse,
)
def unread_count(
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    return NotificationService(db).unread_count(
        current_user.user_id,
    )


@router.delete(
    "/{notification_id}",
)
def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    NotificationService(db).delete_notification(
        notification_id,
        current_user.user_id,
    )

    return {"message": "Notification deleted successfully."}
