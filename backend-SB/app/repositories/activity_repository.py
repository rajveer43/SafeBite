from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog


class ActivityRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_activity(
        self,
        activity: ActivityLog,
    ):

        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)

        return activity

    def get_recent_activities(
        self,
        limit: int = 100,
    ):

        return (
            self.db.query(ActivityLog)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .all()
        )
