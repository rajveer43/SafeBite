from sqlalchemy.orm import Session
from datetime import date
from app.repositories.admin_repository import AdminRepository
from app.schemas.admin import AdminDashboardResponse
from app.repositories.user_repository import UserRepository
from datetime import date
from app.mappers.admin_mapper import (
    AdminMapper,
)
from app.core.constants import (
    INSPECTION_OVERDUE_DAYS,
)
from app.schemas.verification_status import (
    VerificationStatusUpdate,
)
from uuid import UUID
from app.enums.user_role import UserRole

from app.utils.activity_logger import (
    log_activity,
)

from app.enums.activity_type import (
    ActivityType,
)
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType
from app.enums.verification_status import VerificationStatus

class AdminService:

    def __init__(
        self,
        db: Session,
    ):
        self.admin_repository = AdminRepository(db)
        self.user_repository = UserRepository(db)
        self.user_repository = UserRepository(db)

    def get_dashboard(self) -> AdminDashboardResponse:

        dashboard = (
            self.admin_repository.get_dashboard_statistics()

        )

        return AdminDashboardResponse(
            **dashboard
        )
    
    def get_recent_users(
        self,
    ):

        users = (
            self.user_repository
            .get_recent_users()
        )

        return [

            AdminMapper.recent_user(
                user
            )

            for user in users

        ]
    
    def get_recent_restaurants(
        self,
    ):

        restaurants = (
            self.admin_repository
            .get_recent_restaurants()
        )

        return [

            AdminMapper.recent_restaurant(
                restaurant
            )

            for restaurant in restaurants

        ]

    def get_high_risk_restaurants(
        self,
    ):

        return (
            self.admin_repository
            .get_high_risk_restaurants()
        )
    
    def get_pending_complaints(
        self,
    ):

        complaints = (
            self.admin_repository
            .get_pending_complaints()
        )

        return [

            AdminMapper.pending_complaint(
                complaint
            )

            for complaint in complaints

        ]
    
    def get_pending_certificates(
        self,
    ):

        certificates = (
            self.admin_repository
            .get_pending_certificates()
        )

        return [

            AdminMapper.pending_certificate(
                certificate
            )

            for certificate in certificates

        ]
    
    def get_expiring_certificates(
        self,
    ):

        certificates = (

            self.admin_repository
            .get_expiring_certificates()

        )

        today = date.today()

        return [

            {

                "certificate_id":
                certificate.certificate_id,

                "restaurant":
                certificate.restaurant.name,

                "certificate_type":
                certificate.certificate_type.value,

                "expiry_date":
                certificate.expiry_date,

                "days_left":
                (
                    certificate.expiry_date
                    - today
                ).days,

            }

            for certificate in certificates

        ]
    
    def get_overdue_inspections(
        self,
    ):

        rows = (
            self.admin_repository
            .get_overdue_inspections()
        )

        return [

            AdminMapper.overdue_inspection(
                restaurant,
                last_inspection,
            )

            for restaurant, last_inspection in rows

        ]
    
    def get_pending_owners(
        self,
    ):

        owners = (

            self.admin_repository
            .get_pending_owners()

        )

        return [

            AdminMapper.pending_owner(
                owner
            )

            for owner in owners

        ]

    def update_verification_status(

        self,

        user_id: UUID,

        verification_data: VerificationStatusUpdate,

    ):

        user = (

            self.user_repository
            .get_user_by_id(
                user_id
            )

        )

        if not user:

            raise ValueError(
                "User not found."
            )

        if user.role != UserRole.OWNER:

            raise ValueError(
                "Only owners require verification."
            )

        user.verification_status = (
            verification_data.verification_status
        )

        user = (

            self.user_repository
            .update_user(
                user
            )

        )

        status_display = user.verification_status.value.title()

        log_activity(

            db=self.user_repository.db,

            activity_type=ActivityType.USER.value,

            message=(
                f"{user.name} verification "
                f"changed to "
                f"{status_display}."
            ),

            actor_id=user.user_id,

            entity_id=user.user_id,

        )

        is_verified = (
            user.verification_status == VerificationStatus.VERIFIED
        )

        NotificationService(
            self.user_repository.db,
        ).send(

            user_id=user.user_id,

            title=(
                "Account Verified!"
                if is_verified
                else "Account Verification Rejected"
            ),

            message=(
                f"Hello {user.name}, congratulations! Your owner account "
                f"has been verified. You can now access all owner features."
                if is_verified else
                f"Hello {user.name}, your owner account verification has "
                f"been rejected by an administrator. Please contact support."
            ),

            notification_type=(
                NotificationType.SUCCESS
                if is_verified
                else NotificationType.ERROR
            ),
        )

        return (

            AdminMapper
            .verification_status_updated(
                user
            )

        )
    
    
    
