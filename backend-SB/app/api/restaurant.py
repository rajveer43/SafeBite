from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.roles import require_owner, require_verified_owner
from app.dependencies.auth import get_current_user
from app.enums.user_role import UserRole
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
    RestaurantApprovalUpdate,
)
from app.services.restaurant_service import RestaurantService

router = APIRouter(
    prefix="/restaurants",
    tags=["Restaurants"],
)


@router.post(
    "",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_restaurant(
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(require_verified_owner),
    db: Session = Depends(get_db),
):

    service = RestaurantService(db)

    try:

        return service.create_restaurant(
            current_user.user_id,
            restaurant_data,
        )

    except PermissionError as e:

        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[RestaurantResponse],
)
def get_restaurants(
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    return service.get_all_restaurants()


@router.get(
    "/nearby",
    response_model=list[RestaurantResponse],
)
def get_nearby_restaurants(
    latitude: float,
    longitude: float,
    radius: float = 5,
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    return service.get_nearby_restaurants(
        latitude=latitude,
        longitude=longitude,
        radius=radius,
    )

@router.get(
    "/my-restaurants",
    response_model=list[RestaurantResponse],
)
def get_my_restaurants(
    current_user: User = Depends(require_verified_owner),
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    return service.get_my_restaurants(
        current_user.user_id
    )


@router.get(
    "/{restaurant_id}",
    response_model=RestaurantResponse,
)
def get_restaurant(
    restaurant_id: UUID,
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    try:
        return service.get_restaurant(
            restaurant_id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.put(
    "/{restaurant_id}",
    response_model=RestaurantResponse,
)
def update_restaurant(
    restaurant_id: UUID,
    restaurant_data: RestaurantCreate,
    current_user: User = Depends(require_verified_owner),
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    try:
        return service.update_restaurant(
            restaurant_id=restaurant_id,
            owner_id=current_user.user_id,
            restaurant_data=restaurant_data,
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


@router.delete(
    "/{restaurant_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_restaurant(
    restaurant_id: UUID,
    current_user: User = Depends(require_verified_owner),
    db: Session = Depends(get_db),
):
    service = RestaurantService(db)

    try:
        service.delete_restaurant(
            restaurant_id=restaurant_id,
            owner_id=current_user.user_id,
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
    

@router.get(
    "/search",
    response_model=list[RestaurantResponse],
)
def search_restaurants(

    search: Optional[str] = None,

    min_score: Optional[float] = None,

    max_score: Optional[float] = None,

    high_risk: Optional[bool] = None,

    sort_by: Optional[str] = None,

    page: int = 1,

    limit: int = 10,

    db: Session = Depends(get_db),

):

        return (

            RestaurantService(db)
            .search_restaurants(

                search,

                min_score,

                max_score,

                high_risk,

                sort_by,

                page,

                limit,

            )

        )


@router.put(
    "/{restaurant_id}/status",
    response_model=RestaurantResponse,
)
def update_restaurant_status(
    restaurant_id: UUID,
    approval_data: RestaurantApprovalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in [UserRole.INSPECTOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only inspectors or admins can update establishment approval status.",
        )

    service = RestaurantService(db)

    try:
        return service.update_restaurant_status(
            restaurant_id=restaurant_id,
            status_value=approval_data.status,
            actor_id=current_user.user_id,
            notes=approval_data.notes,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )