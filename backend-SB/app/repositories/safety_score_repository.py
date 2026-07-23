from uuid import UUID

from sqlalchemy.orm import Session

from app.models.safety_score import SafetyScore


class SafetyScoreRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_score(
        self,
        score: SafetyScore,
    ) -> SafetyScore:

        self.db.add(score)
        self.db.commit()
        self.db.refresh(score)

        return score

    def get_by_restaurant(
        self,
        restaurant_id: UUID,
    ) -> SafetyScore | None:

        return (
            self.db.query(SafetyScore)
            .filter(SafetyScore.restaurant_id == restaurant_id)
            .first()
        )

    def update_score(
        self,
        score: SafetyScore,
    ) -> SafetyScore:

        self.db.commit()
        self.db.refresh(score)

        return score
