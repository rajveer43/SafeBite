from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.roles import require_inspector
from app.models.user import User
from app.schemas.inspection import (
    InspectionCreate,
    InspectionUpdate,
    InspectionResponse,
)
from app.services.inspection_service import InspectionService

router = APIRouter(
    prefix="/inspections",
    tags=["Inspections"],
)


@router.get(
    "",
    response_model=list[InspectionResponse],
)
def get_inspections(
    restaurant_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = InspectionService(db)
    return service.get_inspections(
        current_user=current_user, restaurant_id=restaurant_id
    )


@router.post(
    "",
    response_model=InspectionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inspection(
    inspection_data: InspectionCreate,
    current_user: User = Depends(require_inspector),
    db: Session = Depends(get_db),
):
    service = InspectionService(db)

    try:
        return service.create_inspection(
            inspector_id=current_user.user_id,
            inspection_data=inspection_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/{inspection_id}",
    response_model=InspectionResponse,
)
def get_inspection(
    inspection_id: UUID,
    db: Session = Depends(get_db),
):
    service = InspectionService(db)

    try:
        return service.get_inspection(inspection_id)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/restaurant/{restaurant_id}",
    response_model=list[InspectionResponse],
)
def get_restaurant_inspections(
    restaurant_id: UUID,
    db: Session = Depends(get_db),
):
    service = InspectionService(db)

    return service.get_restaurant_inspections(restaurant_id)


@router.put(
    "/{inspection_id}",
    response_model=InspectionResponse,
)
def update_inspection(
    inspection_id: UUID,
    inspection_data: InspectionUpdate,
    current_user: User = Depends(require_inspector),
    db: Session = Depends(get_db),
):
    service = InspectionService(db)

    try:
        return service.update_inspection(
            inspection_id,
            inspection_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
