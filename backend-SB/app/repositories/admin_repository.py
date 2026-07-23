from sqlalchemy import func
from sqlalchemy.orm import Session

from datetime import date, timedelta

from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.inspection import Inspection
from app.models.complaint import Complaint
from app.models.certificate import Certificate

from app.enums.user_role import UserRole
from app.enums.complaint_status import ComplaintStatus
from app.enums.certificate_status import CertificateStatus
from app.enums.verification_status import VerificationStatus

from app.core.constants import (
    CERTIFICATE_EXPIRY_WARNING_DAYS,
    HIGH_RISK_SAFETY_SCORE,
    DEFAULT_RECENT_LIMIT,
    DEFAULT_RECENT_LIMIT,
    INSPECTION_OVERDUE_DAYS,
)


class AdminRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_dashboard_statistics(self):

        total_users = self.db.query(User).count()

        total_customers = (
            self.db.query(User).filter(User.role == UserRole.CUSTOMER).count()
        )

        total_owners = (
            self.db.query(User).filter(User.role == UserRole.OWNER).count()
        )

        total_inspectors = (
            self.db.query(User).filter(User.role == UserRole.INSPECTOR).count()
        )

        total_admins = (
            self.db.query(User).filter(User.role == UserRole.ADMIN).count()
        )

        total_restaurants = self.db.query(Restaurant).count()

        total_inspections = self.db.query(Inspection).count()

        total_complaints = self.db.query(Complaint).count()

        pending_complaints = (
            self.db.query(Complaint)
            .filter(Complaint.status == ComplaintStatus.PENDING)
            .count()
        )

        under_investigation_complaints = (
            self.db.query(Complaint)
            .filter(Complaint.status == ComplaintStatus.UNDER_INVESTIGATION)
            .count()
        )

        resolved_complaints = (
            self.db.query(Complaint)
            .filter(Complaint.status == ComplaintStatus.RESOLVED)
            .count()
        )

        total_certificates = self.db.query(Certificate).count()

        verified_certificates = (
            self.db.query(Certificate)
            .filter(Certificate.status == CertificateStatus.VERIFIED)
            .count()
        )

        expired_certificates = (
            self.db.query(Certificate)
            .filter(Certificate.status == CertificateStatus.EXPIRED)
            .count()
        )

        average_safety_score = (
            self.db.query(func.avg(Restaurant.safety_score)).scalar() or 0
        )

        high_risk_restaurants = (
            self.db.query(Restaurant)
            .filter(Restaurant.safety_score < 60)
            .count()
        )

        return {
            "total_users": total_users,
            "total_customers": total_customers,
            "total_owners": total_owners,
            "total_inspectors": total_inspectors,
            "total_admins": total_admins,
            "total_restaurants": total_restaurants,
            "total_inspections": total_inspections,
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "under_investigation_complaints": under_investigation_complaints,
            "resolved_complaints": resolved_complaints,
            "total_certificates": total_certificates,
            "verified_certificates": verified_certificates,
            "expired_certificates": expired_certificates,
            "average_safety_score": round(
                float(average_safety_score),
                2,
            ),
            "high_risk_restaurants": high_risk_restaurants,
        }

    def get_recent_restaurants(
        self,
        limit: int = DEFAULT_RECENT_LIMIT,
    ):

        return (
            self.db.query(Restaurant)
            .order_by(Restaurant.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_high_risk_restaurants(
        self,
    ):

        restaurants = (
            self.db.query(Restaurant)
            .filter(Restaurant.safety_score < HIGH_RISK_SAFETY_SCORE)
            .all()
        )

        result = []

        for restaurant in restaurants:

            pending = (
                self.db.query(Complaint)
                .filter(
                    Complaint.restaurant_id == restaurant.restaurant_id,
                    Complaint.status == ComplaintStatus.PENDING,
                )
                .count()
            )

            expired = (
                self.db.query(Certificate)
                .filter(
                    Certificate.restaurant_id == restaurant.restaurant_id,
                    Certificate.status == CertificateStatus.EXPIRED,
                )
                .count()
            )

            result.append(
                {
                    "restaurant_id": restaurant.restaurant_id,
                    "restaurant_name": restaurant.name,
                    "owner_name": restaurant.owner.name,
                    "safety_score": restaurant.safety_score,
                    "pending_complaints": pending,
                    "expired_certificates": expired,
                }
            )

        return result

    def get_pending_complaints(self):

        return (
            self.db.query(Complaint)
            .filter(Complaint.status == ComplaintStatus.PENDING)
            .order_by(Complaint.created_at.desc())
            .all()
        )

    def get_pending_certificates(
        self,
    ):

        return (
            self.db.query(Certificate)
            .filter(Certificate.status == CertificateStatus.PENDING)
            .order_by(Certificate.created_at.desc())
            .all()
        )

    def get_expiring_certificates(
        self,
    ):

        today = date.today()

        next_month = today + timedelta(days=CERTIFICATE_EXPIRY_WARNING_DAYS)

        return (
            self.db.query(Certificate)
            .filter(
                Certificate.expiry_date >= today,
                Certificate.expiry_date <= next_month,
                Certificate.status != CertificateStatus.EXPIRED,
            )
            .order_by(Certificate.expiry_date)
            .all()
        )

    def get_overdue_inspections(
        self,
    ):

        cutoff = date.today() - timedelta(days=INSPECTION_OVERDUE_DAYS)

        latest_inspection = (
            self.db.query(
                Inspection.restaurant_id,
                func.max(Inspection.inspection_date).label("last_inspection"),
            )
            .group_by(Inspection.restaurant_id)
            .subquery()
        )

        rows = (
            self.db.query(
                Restaurant,
                latest_inspection.c.last_inspection,
            )
            .join(
                latest_inspection,
                Restaurant.restaurant_id == latest_inspection.c.restaurant_id,
            )
            .filter(latest_inspection.c.last_inspection < cutoff)
            .order_by(latest_inspection.c.last_inspection.asc())
            .all()
        )

        result = []

        today = date.today()

        for restaurant, last_inspection in rows:

            result.append(
                {
                    "restaurant_id": restaurant.restaurant_id,
                    "restaurant": restaurant.name,
                    "owner": restaurant.owner.name,
                    "last_inspection": last_inspection,
                    "days_overdue": (today - last_inspection).days
                    - INSPECTION_OVERDUE_DAYS,
                }
            )

        return result

    def get_pending_owners(
        self,
    ):

        return (
            self.db.query(User)
            .filter(
                User.role == UserRole.OWNER,
                User.verification_status == VerificationStatus.PENDING,
            )
            .order_by(User.created_at.desc())
            .all()
        )
