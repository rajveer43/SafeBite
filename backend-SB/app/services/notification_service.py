from uuid import UUID

from sqlalchemy.orm import Session

from app.enums.notification_type import NotificationType
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository

from app.repositories.user_repository import UserRepository
from app.enums.verification_status import VerificationStatus


class NotificationService:

    def __init__(
        self,
        db: Session,
    ):
        self.notification_repository = NotificationRepository(db)

    def send(
        self,
        user_id: UUID,
        title: str,
        message: str,
        notification_type: NotificationType,
    ):

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
        )

        return self.notification_repository.create_notification(notification)

    def get_notifications(
        self,
        user_id: UUID,
    ):

        return self.notification_repository.get_user_notifications(user_id)

    def mark_as_read(
        self,
        notification_id: UUID,
        user_id: UUID,
    ):

        notification = self.notification_repository.get_notification(
            notification_id
        )

        if not notification:
            raise ValueError("Notification not found.")

        notification.is_read = True

        if notification.user_id != user_id:
            raise PermissionError("Access denied.")

        return self.notification_repository.update_notification(notification)

    def mark_all_as_read(
        self,
        user_id: UUID,
    ):

        notifications = self.notification_repository.get_user_notifications(
            user_id
        )

        for notification in notifications:
            notification.is_read = True

        self.notification_repository.db.commit()

    def unread_count(
        self,
        user_id: UUID,
    ):

        return {
            "count": self.notification_repository.get_unread_count(user_id)
        }

    def delete_notification(
        self,
        notification_id: UUID,
        user_id: UUID,
    ):

        notification = self.notification_repository.get_notification(
            notification_id
        )

        if not notification:
            raise ValueError("Notification not found.")

        if notification.user_id != user_id:
            raise PermissionError("Access denied.")

        self.notification_repository.delete_notification(notification)
