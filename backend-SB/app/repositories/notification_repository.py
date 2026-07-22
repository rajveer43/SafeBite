from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_notification(
        self,
        notification: Notification,
    ):

        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)

        return notification

    def get_user_notifications(
        self,
        user_id: UUID,
    ):

        return (
            self.db.query(Notification)
            .filter(
                Notification.user_id == user_id
            )
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

    def get_notification(
        self,
        notification_id: UUID,
    ):

        return (
            self.db.query(Notification)
            .filter(
                Notification.notification_id == notification_id
            )
            .first()
        )

    def get_unread_count(
        self,
        user_id: UUID,
    ):

        return (
            self.db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == False,
            )
            .count()
        )

    def update_notification(
        self,
        notification: Notification,
    ):

        self.db.commit()
        self.db.refresh(notification)

        return notification

    def delete_notification(
        self,
        notification: Notification,
    ):

        self.db.delete(notification)
        self.db.commit()