from fastapi import (
    APIRouter,
    Depends,
)
from uuid import UUID

from sqlalchemy.orm import Session

from app.database.session import get_db

from app.dependencies.roles import require_admin

from app.models.user import User

from app.schemas.admin import (
    AdminDashboardResponse,
)

from app.services.admin_service import (
    AdminService,
)
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityResponse
from app.schemas.recent_user import RecentUserResponse
from app.schemas.recent_restaurant import RecentRestaurantResponse
from app.schemas.high_risk_restaurant import HighRiskRestaurantResponse
from app.schemas.pending_complaint import PendingComplaintResponse
from app.schemas.pending_certificate import PendingCertificateResponse
from app.schemas.expiring_certificate import ExpiringCertificateResponse
from app.schemas.overdue_inspection import OverdueInspectionResponse
from app.schemas.pending_owner import PendingOwnerResponse
from app.schemas.verification_status import VerificationStatusUpdate
from app.schemas.restaurant import AssignInspectorRequest, RestaurantResponse

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse,
)
def get_dashboard(
    current_user: User = Depends(
        require_admin
    ),
    db: Session = Depends(
        get_db
    ),
):

    service = AdminService(
        db
    )

    return service.get_dashboard()

@router.get(
    "/users",
    response_model=list[RecentUserResponse],
)
def get_users(
    search: str | None = None,
    role: str | None = None,
    page: int = 1,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.repositories.user_repository import UserRepository
    from app.mappers.admin_mapper import AdminMapper

    users = UserRepository(db).get_all_users(search=search, role=role, page=page)
    return [AdminMapper.recent_user(u) for u in users]


@router.get(
    "/recent-users",
    response_model=list[RecentUserResponse],
)
def get_recent_users(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (
        AdminService(db)
        .get_recent_users()
    )

@router.get(
    "/activity",
    response_model=list[ActivityResponse],
)
def get_activity(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (
        ActivityService(db)
        .get_recent_activities()
    )

@router.get(
    "/recent-restaurants",
    response_model=list[
        RecentRestaurantResponse
    ],
)
def get_recent_restaurants(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (
        AdminService(db)
        .get_recent_restaurants()
    )

@router.get(
    "/high-risk-restaurants",
    response_model=list[
        HighRiskRestaurantResponse
    ],
)
def get_high_risk_restaurants(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (
        AdminService(db)
        .get_high_risk_restaurants()
    )

@router.get(
    "/pending-complaints",
    response_model=list[
        PendingComplaintResponse
    ],
)
def get_pending_complaints(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .get_pending_complaints()

    )

@router.get(
    "/pending-certificates",
    response_model=list[
        PendingCertificateResponse
    ],
)
def get_pending_certificates(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .get_pending_certificates()

    )

@router.get(
    "/expiring-certificates",
    response_model=list[
        ExpiringCertificateResponse
    ],
)
def get_expiring_certificates(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .get_expiring_certificates()

    )

@router.get(
    "/overdue-inspections",
    response_model=list[
        OverdueInspectionResponse
    ],
)
def get_overdue_inspections(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .get_overdue_inspections()

    )

@router.get(
    "/pending-owners",
    response_model=list[
        PendingOwnerResponse
    ],
)
def get_pending_owners(

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .get_pending_owners()

    )

@router.patch(
    "/users/{user_id}/verification-status",
)
def update_verification_status(

    user_id: UUID,

    verification_data: VerificationStatusUpdate,

    current_user: User = Depends(
        require_admin
    ),

    db: Session = Depends(
        get_db
    ),

):

    return (

        AdminService(db)
        .update_verification_status(

            user_id,

            verification_data,

        )

    )


@router.get(
    "/inspectors",
)
def get_inspectors(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.repositories.user_repository import UserRepository

    user_repo = UserRepository(db)
    inspectors = user_repo.get_inspectors()
    return [
        {
            "id": str(i.user_id),
            "name": i.name,
            "email": i.email,
            "phone_number": i.phone_number,
        }
        for i in inspectors
    ]


@router.patch(
    "/restaurants/{restaurant_id}/assign-inspector",
    response_model=RestaurantResponse,
)
def assign_inspector(
    restaurant_id: UUID,
    payload: AssignInspectorRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.services.restaurant_service import RestaurantService

    service = RestaurantService(db)
    return service.assign_inspector(
        restaurant_id=restaurant_id,
        inspector_id=payload.inspector_id,
        admin_id=current_user.user_id,
    )