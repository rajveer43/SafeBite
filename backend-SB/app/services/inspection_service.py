from datetime import date, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.inspection import Inspection
from app.models.user import User
from app.enums.user_role import UserRole
from app.repositories.inspection_repository import InspectionRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.inspection import (
    InspectionCreate,
    InspectionUpdate,
    InspectionResponse,
)
from app.services.safety_score_service import SafetyScoreService

from app.utils.activity_logger import log_activity
from app.enums.activity_type import ActivityType
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType


class InspectionService:

    def __init__(
        self,
        db: Session,
    ):
        self.inspection_repository = InspectionRepository(db)
        self.restaurant_repository = RestaurantRepository(db)

    def create_inspection(
        self,
        inspector_id: UUID,
        inspection_data: InspectionCreate,
    ) -> InspectionResponse:

        restaurant = (
            self.restaurant_repository.get_restaurant_by_id(
                inspection_data.restaurant_id
            )
        )

        if not restaurant:
            raise ValueError(
                "Restaurant not found."
            )

        raw_date = (
            inspection_data.inspection_date
            or inspection_data.scheduled_date
            or date.today()
        )
        if isinstance(raw_date, datetime):
            insp_date = raw_date.date()
        elif isinstance(raw_date, str):
            clean_str = raw_date.split("T")[0]
            insp_date = date.fromisoformat(clean_str)
        else:
            insp_date = raw_date
        remarks = inspection_data.remarks or inspection_data.notes

        inspection = Inspection(
            restaurant_id=inspection_data.restaurant_id,
            inspector_id=inspector_id,
            inspection_date=insp_date,
            score=inspection_data.score,
            remarks=remarks,
            parameters=inspection_data.parameters or {},
        )

        inspection = (
            self.inspection_repository.create_inspection(
                inspection
            )
        )

        if inspection.score is not None:
            SafetyScoreService(
                self.inspection_repository.db
            ).calculate_score(
                inspection.restaurant_id
            )

        log_activity(
            db=self.inspection_repository.db,
            activity_type=ActivityType.INSPECTION.value,
            message=f"Inspection scheduled for '{restaurant.name}'.",
            actor_id=inspection.inspector_id,
            entity_id=inspection.inspection_id,
        )

        res = InspectionResponse.model_validate(inspection)
        res.id = inspection.inspection_id
        res.restaurant_name = restaurant.name if restaurant else None
        res.scheduled_date = insp_date
        res.status = "completed" if inspection.score is not None else "scheduled"
        res.notes = remarks
        return res

    def _determine_status(self, insp: Inspection) -> str:
        if insp.score is not None:
            return "completed"
        if insp.parameters and isinstance(insp.parameters, dict):
            status_val = insp.parameters.get("status")
            if status_val:
                return status_val
        return "scheduled"

    def get_inspections(
        self,
        current_user: User | None = None,
        restaurant_id: UUID | None = None,
    ) -> list[InspectionResponse]:
        if restaurant_id:
            inspections = self.inspection_repository.get_restaurant_inspections(restaurant_id)
        elif current_user and current_user.role == UserRole.INSPECTOR:
            inspections = self.inspection_repository.get_all_inspections(inspector_id=current_user.user_id)
        elif current_user and current_user.role == UserRole.OWNER:
            inspections = self.inspection_repository.get_owner_inspections(owner_id=current_user.user_id)
        else:
            inspections = self.inspection_repository.get_all_inspections()

        res_list = []
        for insp in inspections:
            item = InspectionResponse.model_validate(insp)
            item.id = insp.inspection_id
            item.restaurant_name = insp.restaurant.name if getattr(insp, "restaurant", None) else None
            item.inspector_name = insp.inspector.name if getattr(insp, "inspector", None) else None
            item.scheduled_date = insp.inspection_date
            item.completed_date = insp.inspection_date if insp.score is not None else None
            item.status = self._determine_status(insp)
            item.notes = insp.remarks
            res_list.append(item)
        return res_list

    def get_inspection(
        self,
        inspection_id: UUID,
    ) -> InspectionResponse:

        inspection = (
            self.inspection_repository.get_inspection_by_id(
                inspection_id
            )
        )

        if not inspection:
            raise ValueError(
                "Inspection not found."
            )

        res = InspectionResponse.model_validate(inspection)
        res.id = inspection.inspection_id
        res.restaurant_name = inspection.restaurant.name if getattr(inspection, "restaurant", None) else None
        res.inspector_name = inspection.inspector.name if getattr(inspection, "inspector", None) else None
        res.scheduled_date = inspection.inspection_date
        res.completed_date = inspection.inspection_date if inspection.score is not None else None
        res.status = self._determine_status(inspection)
        res.notes = inspection.remarks
        return res

    def get_restaurant_inspections(
        self,
        restaurant_id: UUID,
    ) -> list[InspectionResponse]:

        inspections = (
            self.inspection_repository.get_restaurant_inspections(
                restaurant_id
            )
        )

        res_list = []
        for insp in inspections:
            item = InspectionResponse.model_validate(insp)
            item.id = insp.inspection_id
            item.restaurant_name = insp.restaurant.name if getattr(insp, "restaurant", None) else None
            item.inspector_name = insp.inspector.name if getattr(insp, "inspector", None) else None
            item.scheduled_date = insp.inspection_date
            item.completed_date = insp.inspection_date if insp.score is not None else None
            item.status = self._determine_status(insp)
            item.notes = insp.remarks
            res_list.append(item)
        return res_list

    def update_inspection(
        self,
        inspection_id: UUID,
        inspection_data: InspectionUpdate,
    ) -> InspectionResponse:

        inspection = (
            self.inspection_repository.get_inspection_by_id(
                inspection_id
            )
        )

        if not inspection:
            raise ValueError(
                "Inspection not found."
            )

        if inspection_data.inspection_date is not None:
            raw_date = inspection_data.inspection_date
        elif inspection_data.scheduled_date is not None:
            raw_date = inspection_data.scheduled_date
        else:
            raw_date = None

        if raw_date is not None:
            if isinstance(raw_date, datetime):
                inspection.inspection_date = raw_date.date()
            elif isinstance(raw_date, str):
                inspection.inspection_date = date.fromisoformat(raw_date.split("T")[0])
            else:
                inspection.inspection_date = raw_date

        if inspection_data.score is not None:
            inspection.score = inspection_data.score

        if inspection_data.remarks is not None:
            inspection.remarks = inspection_data.remarks
        elif inspection_data.notes is not None:
            inspection.remarks = inspection_data.notes

        current_params = dict(inspection.parameters) if (inspection.parameters and isinstance(inspection.parameters, dict)) else {}
        if inspection_data.parameters is not None:
            current_params.update(inspection_data.parameters)
        if inspection_data.status is not None:
            current_params["status"] = inspection_data.status
        inspection.parameters = current_params

        inspection = (
            self.inspection_repository.update_inspection(
                inspection
            )
        )

        if inspection.score is not None:
            SafetyScoreService(
                self.inspection_repository.db
            ).calculate_score(
                inspection.restaurant_id
            )

        restaurant = self.restaurant_repository.get_restaurant_by_id(inspection.restaurant_id)

        res = InspectionResponse.model_validate(inspection)
        res.id = inspection.inspection_id
        res.restaurant_name = restaurant.name if restaurant else None
        res.scheduled_date = inspection.inspection_date
        res.completed_date = inspection.inspection_date if inspection.score is not None else None
        res.status = self._determine_status(inspection)
        res.notes = inspection.remarks
        return res