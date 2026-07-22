from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.complaint import Complaint
from app.models.restaurant import Restaurant


class ComplaintRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_complaint(
        self,
        complaint: Complaint,
    ) -> Complaint:

        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)

        return complaint

    def get_customer_complaints(
        self,
        customer_id: UUID,
    ):
        return (
            self.db.query(Complaint)
            .options(joinedload(Complaint.restaurant))
            .filter(Complaint.customer_id == customer_id)
            .order_by(Complaint.created_at.desc())
            .all()
        )

    def get_all_owner_complaints(
        self,
        owner_id: UUID,
    ) -> list[Complaint]:
        return (
            self.db.query(Complaint)
            .join(Restaurant)
            .options(joinedload(Complaint.restaurant))
            .filter(Restaurant.owner_id == owner_id)
            .order_by(Complaint.created_at.desc())
            .all()
        )

    def get_all_complaints(
        self,
    ) -> list[Complaint]:
        return (
            self.db.query(Complaint)
            .options(joinedload(Complaint.restaurant))
            .order_by(Complaint.created_at.desc())
            .all()
        )

    def get_complaint_by_id(
        self,
        complaint_id: UUID,
    ) -> Complaint | None:

        return (
            self.db.query(Complaint)
            .options(joinedload(Complaint.restaurant))
            .filter(
                Complaint.complaint_id == complaint_id
            )
            .first()
        )

    def get_restaurant_complaints(
        self,
        restaurant_id: UUID,
    ) -> list[Complaint]:

        return (
            self.db.query(Complaint)
            .options(joinedload(Complaint.restaurant))
            .filter(
                Complaint.restaurant_id == restaurant_id
            )
            .order_by(Complaint.created_at.desc())
            .all()
        )
    
    def get_customer_complaint(
        self,
        complaint_id: UUID,
        customer_id: UUID,
    ) -> Complaint | None:

        return (
            self.db.query(Complaint)
            .filter(
                Complaint.complaint_id == complaint_id,
                Complaint.customer_id == customer_id,
            )
            .first()
        )
    
    def get_owner_complaint(
        self,
        complaint_id: UUID,
        owner_id: UUID,
    ) -> Complaint | None:

        return (
            self.db.query(Complaint)
            .join(Restaurant)
            .filter(
                Complaint.complaint_id == complaint_id,
                Restaurant.owner_id == owner_id,
            )
            .first()
        )

    def update_complaint(
        self,
        complaint: Complaint,
    ) -> Complaint:

        self.db.commit()
        self.db.refresh(complaint)

        return complaint