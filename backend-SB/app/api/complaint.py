from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.roles import (
    require_customer,
    require_inspector,
)
from app.models.user import User
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
)
from app.services.complaint_service import ComplaintService
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"],
)


@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_complaint(
    complaint_data: ComplaintCreate,
    current_user: User = Depends(require_customer),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)

    try:
        return service.create_complaint(
            customer_id=current_user.user_id,
            complaint_data=complaint_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/my",
    response_model=list[ComplaintResponse],
)
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)

    return service.get_my_complaints(current_user)


@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def get_complaint(
    complaint_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)

    try:
        return service.get_complaint(
            complaint_id,
            current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/restaurant/{restaurant_id}",
    response_model=list[ComplaintResponse],
)
def get_restaurant_complaints(
    restaurant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)

    return service.get_restaurant_complaints(
        restaurant_id,
        current_user,
    )


@router.put(
    "/{complaint_id}",
    response_model=ComplaintResponse,
)
def update_complaint(
    complaint_id: UUID,
    complaint_data: ComplaintUpdate,
    current_user: User = Depends(require_inspector),
    db: Session = Depends(get_db),
):
    service = ComplaintService(db)

    try:
        return service.update_complaint(
            complaint_id,
            complaint_data,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
