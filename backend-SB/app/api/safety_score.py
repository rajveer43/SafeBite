from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.safety_score import SafetyScoreResponse
from app.services.safety_score_service import SafetyScoreService

router = APIRouter(
    prefix="/safety-scores",
    tags=["Safety Scores"],
)


@router.post(
    "/calculate/{restaurant_id}",
    response_model=SafetyScoreResponse,
)
def calculate_score(
    restaurant_id: UUID,
    db: Session = Depends(get_db),
):

    service = SafetyScoreService(db)

    return service.calculate_score(restaurant_id)


@router.get(
    "/{restaurant_id}",
    response_model=SafetyScoreResponse,
)
def get_score(
    restaurant_id: UUID,
    db: Session = Depends(get_db),
):

    service = SafetyScoreService(db)

    score = service.score_repository.get_by_restaurant(restaurant_id)

    if not score:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety score not found.",
        )

    return score
