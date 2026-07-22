from uuid import UUID

from sqlalchemy.orm import Session

from app.utils.safety_score_calculator import (
    SafetyScoreCalculator,
)

from app.models.safety_score import SafetyScore
from app.repositories.safety_score_repository import SafetyScoreRepository
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.certificate_repository import CertificateRepository
from app.repositories.restaurant_repository import RestaurantRepository

from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType


class SafetyScoreService:

    def __init__(
        self,
        db: Session,
    ):
        self.score_repository = SafetyScoreRepository(db)
        self.inspection_repository = InspectionRepository(db)
        self.complaint_repository = ComplaintRepository(db)
        self.certificate_repository = CertificateRepository(db)
        self.restaurant_repository = RestaurantRepository(db)

    def calculate_score(
        self,
        restaurant_id: UUID,
    ) -> SafetyScore:

        inspections = (
            self.inspection_repository.get_restaurant_inspections(
                restaurant_id
            )
        )

        complaints = (
            self.complaint_repository.get_restaurant_complaints(
                restaurant_id
            )
        )

        certificates = (
            self.certificate_repository.get_restaurant_certificates(
                restaurant_id
            )
        )

        calculator = SafetyScoreCalculator()

        result = calculator.calculate(
            inspections=inspections,
            complaints=complaints,
            certificates=certificates,
        )

        restaurant = (
            self.restaurant_repository.get_restaurant_by_id(
                restaurant_id
            )
        )

        if restaurant:

            self.restaurant_repository.update_safety_score(
                restaurant,
                result["final_score"],
            )

        existing_score = (
            self.score_repository.get_by_restaurant(
                restaurant_id
            )
        )

        if existing_score:

            existing_score.final_score = (
                result["final_score"]
            )

            existing_score.inspection_weight = (
                result["inspection_weight"]
            )

            existing_score.complaint_weight = (
                result["complaint_weight"]
            )

            existing_score.certificate_weight = (
                result["certificate_weight"]
            )

            existing_score.feedback_weight = 0

            score = (
                self.score_repository.update_score(
                    existing_score
                )
            )

        else:

            score = SafetyScore(
                restaurant_id=restaurant_id,
                final_score=result["final_score"],
                inspection_weight=result["inspection_weight"],
                complaint_weight=result["complaint_weight"],
                certificate_weight=result["certificate_weight"],
                feedback_weight=0,
            )

            score = (
                self.score_repository.create_score(
                    score
                )
            )

        if (
            restaurant
            and result["final_score"] < 40
        ):

            NotificationService(
                self.score_repository.db,
            ).send(

                user_id=restaurant.owner_id,

                title="High Risk Restaurant",

                message=(
                    f"Your restaurant safety score is "
                    f"{result['final_score']:.2f}. "
                    "Immediate corrective action is required."
                ),

                notification_type=NotificationType.ERROR,
            )

        return score