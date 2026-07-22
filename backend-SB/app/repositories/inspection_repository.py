from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.inspection import Inspection
from app.models.restaurant import Restaurant


class InspectionRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_inspection(
        self,
        inspection: Inspection,
    ) -> Inspection:

        self.db.add(inspection)
        self.db.commit()
        self.db.refresh(inspection)

        return inspection

    def get_inspection_by_id(
        self,
        inspection_id: UUID,
    ) -> Inspection | None:

        return (
            self.db.query(Inspection)
            .options(
                joinedload(Inspection.restaurant),
                joinedload(Inspection.inspector),
            )
            .filter(
                Inspection.inspection_id == inspection_id
            )
            .first()
        )

    def get_restaurant_inspections(
        self,
        restaurant_id: UUID,
    ) -> list[Inspection]:

        return (
            self.db.query(Inspection)
            .options(
                joinedload(Inspection.restaurant),
                joinedload(Inspection.inspector),
            )
            .filter(
                Inspection.restaurant_id == restaurant_id
            )
            .order_by(Inspection.created_at.desc())
            .all()
        )

    def get_all_inspections(
        self,
        inspector_id: UUID | None = None,
    ) -> list[Inspection]:
        query = (
            self.db.query(Inspection)
            .options(
                joinedload(Inspection.restaurant),
                joinedload(Inspection.inspector),
            )
        )
        if inspector_id:
            query = query.filter(Inspection.inspector_id == inspector_id)
        return query.order_by(Inspection.created_at.desc()).all()

    def get_owner_inspections(
        self,
        owner_id: UUID,
    ) -> list[Inspection]:
        return (
            self.db.query(Inspection)
            .join(Restaurant)
            .options(
                joinedload(Inspection.restaurant),
                joinedload(Inspection.inspector),
            )
            .filter(Restaurant.owner_id == owner_id)
            .order_by(Inspection.created_at.desc())
            .all()
        )

    def update_inspection(
        self,
        inspection: Inspection,
    ) -> Inspection:

        self.db.commit()
        self.db.refresh(inspection)

        return inspection