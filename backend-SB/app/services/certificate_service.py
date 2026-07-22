from uuid import UUID

from sqlalchemy.orm import Session

from app.models.certificate import Certificate
from app.repositories.certificate_repository import CertificateRepository
from app.schemas.certificate import (
    CertificateCreate,
    CertificateUpdate,
)
from app.services.safety_score_service import SafetyScoreService
from app.utils.activity_logger import log_activity
from app.enums.activity_type import ActivityType
from app.repositories.user_repository import UserRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType
from app.enums.verification_status import VerificationStatus
from app.enums.certificate_status import CertificateStatus
from app.enums.notification_type import NotificationType


class CertificateService:

    def __init__(
        self,
        db: Session,
    ):
        self.certificate_repository = CertificateRepository(db)
        self.user_repository = UserRepository(db)
        self.restaurant_repository = RestaurantRepository(db)
        

    def create_certificate(
        self,
        owner_id_or_data: UUID | CertificateCreate,
        certificate_data: CertificateCreate | None = None,
    ):
        if isinstance(owner_id_or_data, CertificateCreate):
            certificate_data = owner_id_or_data
            owner_id = None
        else:
            owner_id = owner_id_or_data

        certificate = Certificate(
            restaurant_id=certificate_data.restaurant_id,
            certificate_type=certificate_data.certificate_type,
            certificate_number=certificate_data.certificate_number,
            issuing_authority=certificate_data.issuing_authority,
            issue_date=certificate_data.issue_date,
            expiry_date=certificate_data.expiry_date,
            document_url=certificate_data.document_url,
        )

        certificate = self.certificate_repository.create_certificate(
            certificate
        )
        restaurant = (
            self.restaurant_repository.get_restaurant_by_id(
                certificate.restaurant_id
            )
        )

        if restaurant and restaurant.status == "pending":
            restaurant.status = "under_review"
            self.restaurant_repository.update_restaurant(restaurant)

        SafetyScoreService(
            self.certificate_repository.db
        ).calculate_score(
            certificate.restaurant_id
        )

        log_activity(
            db=self.certificate_repository.db,
            activity_type=ActivityType.CERTIFICATE.value,
            message=f"{certificate.certificate_type.value} certificate uploaded.",
            entity_id=certificate.certificate_id,
        )

        if restaurant and restaurant.owner_id:
            try:
                NotificationService(
                    self.certificate_repository.db,
                ).send(
                    user_id=restaurant.owner_id,
                    title="Certificate Uploaded",
                    message="Your certificate has been uploaded and is awaiting verification.",
                    notification_type=NotificationType.INFO,
                )
            except Exception:
                pass

        return certificate

    def get_certificate(
        self,
        certificate_id: UUID,
    ):

        certificate = (
            self.certificate_repository.get_certificate_by_id(
                certificate_id
            )
        )

        if not certificate:
            raise ValueError(
                "Certificate not found."
            )

        return certificate

    def get_restaurant_certificates(
        self,
        restaurant_id: UUID,
    ):

        return (
            self.certificate_repository
            .get_restaurant_certificates(
                restaurant_id
            )
        )

    def get_all_certificates(
        self,
        status_filter: str | None = None,
        restaurant_id: UUID | None = None,
        owner_id: UUID | None = None,
    ):
        query = self.certificate_repository.db.query(Certificate)
        if restaurant_id:
            query = query.filter(Certificate.restaurant_id == restaurant_id)
        elif owner_id:
            owner_restaurants = self.restaurant_repository.get_restaurants_by_owner(owner_id)
            rest_ids = [r.restaurant_id for r in owner_restaurants]
            if rest_ids:
                query = query.filter(Certificate.restaurant_id.in_(rest_ids))
            else:
                return []

        if status_filter:
            query = query.filter(Certificate.status == status_filter)

        return query.order_by(Certificate.created_at.desc()).all()

    def update_certificate(
        self,
        certificate_id: UUID,
        certificate_data: CertificateUpdate,
    ):

        certificate = (
            self.certificate_repository.get_certificate_by_id(
                certificate_id
            )
        )

        if not certificate:
            raise ValueError(
                "Certificate not found."
            )

        certificate.certificate_type = (
            certificate_data.certificate_type
        )

        certificate.certificate_number = (
            certificate_data.certificate_number
        )

        certificate.issuing_authority = (
            certificate_data.issuing_authority
        )

        certificate.issue_date = (
            certificate_data.issue_date
        )

        certificate.expiry_date = (
            certificate_data.expiry_date
        )

        certificate.status = (
            certificate_data.status
        )

        certificate.document_url = (
            certificate_data.document_url
        )

        certificate = self.certificate_repository.update_certificate(
            certificate
        )

        restaurant = (
    self.restaurant_repository.get_restaurant_by_id(
        certificate.restaurant_id
    )
)

        if certificate.status == CertificateStatus.VERIFIED:

            NotificationService(
                self.certificate_repository.db,
            ).send(

                user_id=restaurant.owner_id,

                title="Certificate Verified",

                message=(
                    "Your certificate has been verified successfully."
                ),

                notification_type=NotificationType.SUCCESS,
            )

        elif certificate.status == CertificateStatus.REJECTED:

            NotificationService(
                self.certificate_repository.db,
            ).send(

                user_id=restaurant.owner_id,

                title="Certificate Rejected",

                message=(
                    "Your certificate has been rejected."
                ),

                notification_type=NotificationType.ERROR,
            )

        elif certificate.status == CertificateStatus.EXPIRED:

            NotificationService(
                self.certificate_repository.db,
            ).send(

                user_id=restaurant.owner_id,

                title="Certificate Expired",

                message=(
                    "Your certificate has expired."
                ),

                notification_type=NotificationType.WARNING,
            )

        SafetyScoreService(
            self.certificate_repository.db
        ).calculate_score(
            certificate.restaurant_id
        )

        return certificate

    def delete_certificate(
        self,
        certificate_id: UUID,
    ):

        certificate = (
            self.certificate_repository.get_certificate_by_id(
                certificate_id
            )
        )

        if not certificate:
            raise ValueError(
                "Certificate not found."
            )

        self.certificate_repository.delete_certificate(
            certificate
        )