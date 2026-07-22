from uuid import UUID
from sqlalchemy.orm import Session

from app.services.activity_service import ActivityService


def log_activity(
    db: Session,
    activity_type: str,
    message: str,
    actor_id: UUID | None = None,
    entity_id: UUID | None = None,
):

    ActivityService(db).log_activity(
        activity_type=activity_type,
        message=message,
        actor_id=actor_id,
        entity_id=entity_id,
    )