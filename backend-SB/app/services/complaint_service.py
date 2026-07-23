from uuid import UUID

from sqlalchemy.orm import Session

from app.models.complaint import Complaint
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
)
from app.services.safety_score_service import SafetyScoreService
from app.enums.user_role import UserRole
from app.models.user import User
from app.utils.activity_logger import log_activity
from app.enums.activity_type import ActivityType
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType
from app.enums.complaint_status import ComplaintStatus


class ComplaintService:

    def __init__(
        self,
        db: Session,
    ):
        self.complaint_repository = ComplaintRepository(db)
        self.restaurant_repository = RestaurantRepository(db)

    def create_complaint(
        self,
        customer_id: UUID,
        complaint_data: ComplaintCreate,
    ) -> ComplaintResponse:

        restaurant = self.restaurant_repository.get_restaurant_by_id(
            complaint_data.restaurant_id
        )

        if not restaurant:
            raise ValueError("Restaurant not found.")

        category = complaint_data.category or complaint_data.title

        complaint = Complaint(
            customer_id=customer_id,
            restaurant_id=complaint_data.restaurant_id,
            description=complaint_data.description,
            category=category,
            evidence_url=complaint_data.evidence_url,
        )

        complaint = self.complaint_repository.create_complaint(complaint)

        SafetyScoreService(self.complaint_repository.db).calculate_score(
            complaint.restaurant_id
        )

        log_activity(
            db=self.complaint_repository.db,
            activity_type=ActivityType.COMPLAINT.value,
            message=f"Complaint submitted for restaurant '{restaurant.name}'.",
            actor_id=complaint.customer_id,
            entity_id=complaint.complaint_id,
        )

        NotificationService(
            self.complaint_repository.db,
        ).send(
            user_id=restaurant.owner_id,
            title="New Complaint",
            message="A new complaint has been submitted against your restaurant.",
            notification_type=NotificationType.WARNING,
        )

        NotificationService(
            self.complaint_repository.db,
        ).send(
            user_id=customer_id,
            title="Complaint Submitted",
            message="Your complaint has been submitted successfully.",
            notification_type=NotificationType.SUCCESS,
        )

        res = ComplaintResponse.model_validate(complaint)
        res.restaurant_name = restaurant.name if restaurant else None
        return res

    def get_my_complaints(
        self,
        current_user: User | UUID,
    ) -> list[ComplaintResponse]:
        if isinstance(current_user, User):
            if current_user.role == UserRole.OWNER:
                complaints = (
                    self.complaint_repository.get_all_owner_complaints(
                        current_user.user_id
                    )
                )
            elif current_user.role in (UserRole.INSPECTOR, UserRole.ADMIN):
                complaints = self.complaint_repository.get_all_complaints()
            else:
                complaints = self.complaint_repository.get_customer_complaints(
                    current_user.user_id
                )
        else:
            complaints = self.complaint_repository.get_customer_complaints(
                current_user
            )

        res_list = []
        for c in complaints:
            item = ComplaintResponse.model_validate(c)
            item.restaurant_name = (
                c.restaurant.name if getattr(c, "restaurant", None) else None
            )
            res_list.append(item)
        return res_list

    def get_complaint(
        self,
        complaint_id: UUID,
        current_user: User,
    ) -> ComplaintResponse:

        if current_user.role == UserRole.INSPECTOR:

            complaint = self.complaint_repository.get_complaint_by_id(
                complaint_id
            )

        elif current_user.role == UserRole.CUSTOMER:

            complaint = self.complaint_repository.get_customer_complaint(
                complaint_id,
                current_user.user_id,
            )

        elif current_user.role == UserRole.OWNER:

            complaint = self.complaint_repository.get_owner_complaint(
                complaint_id,
                current_user.user_id,
            )

        else:
            complaint = None

        if not complaint:
            raise ValueError("Complaint not found or access denied.")

        return ComplaintResponse.model_validate(complaint)

    def get_restaurant_complaints(
        self,
        restaurant_id: UUID,
        current_user: User,
    ) -> list[ComplaintResponse]:

        if current_user.role == UserRole.OWNER:

            restaurant = self.restaurant_repository.get_restaurant_by_owner(
                restaurant_id,
                current_user.user_id,
            )

            if not restaurant:
                raise ValueError("Restaurant not found or access denied.")

        elif current_user.role != UserRole.INSPECTOR:

            raise PermissionError("Access denied.")

        complaints = self.complaint_repository.get_restaurant_complaints(
            restaurant_id
        )

        return [
            ComplaintResponse.model_validate(complaint)
            for complaint in complaints
        ]

    def update_complaint(
        self,
        complaint_id: UUID,
        complaint_data: ComplaintUpdate,
    ) -> ComplaintResponse:

        complaint = self.complaint_repository.get_complaint_by_id(complaint_id)

        if not complaint:
            raise ValueError("Complaint not found.")

        complaint.status = complaint_data.status
        complaint = self.complaint_repository.update_complaint(complaint)

        if complaint.status == ComplaintStatus.PENDING:

            NotificationService(
                self.complaint_repository.db,
            ).send(
                user_id=complaint.customer_id,
                title="Complaint Submitted",
                message="Your complaint has been submitted successfully.",
                notification_type=NotificationType.INFO,
            )

        elif complaint.status == ComplaintStatus.UNDER_INVESTIGATION:

            NotificationService(
                self.complaint_repository.db,
            ).send(
                user_id=complaint.customer_id,
                title="Complaint Under Investigation",
                message="Your complaint is currently under investigation.",
                notification_type=NotificationType.INFO,
            )

        elif complaint.status == ComplaintStatus.RESOLVED:

            NotificationService(
                self.complaint_repository.db,
            ).send(
                user_id=complaint.customer_id,
                title="Complaint Resolved",
                message="Your complaint has been resolved successfully.",
                notification_type=NotificationType.SUCCESS,
            )

        SafetyScoreService(self.complaint_repository.db).calculate_score(
            complaint.restaurant_id
        )

        return ComplaintResponse.model_validate(complaint)
