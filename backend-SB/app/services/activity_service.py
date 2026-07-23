from uuid import UUID

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog

from app.repositories.activity_repository import (
    ActivityRepository,
)


class ActivityService:

    def __init__(
        self,
        db: Session,
    ):
        self.repository = ActivityRepository(db)

    def log_activity(
        self,
        activity_type: str,
        message: str,
        actor_id: UUID | None = None,
        entity_id: UUID | None = None,
    ):

        activity = ActivityLog(
            activity_type=activity_type,
            message=message,
            actor_id=actor_id,
            entity_id=entity_id,
        )

        return self.repository.create_activity(activity)

    def get_recent(self):

        return self.get_recent_activities()

    def get_recent_activities(self):

        return self.repository.get_recent_activities()
