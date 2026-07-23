from uuid import UUID

from sqlalchemy.orm import Session

from app.models.certificate import Certificate


class CertificateRepository:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_certificate(
        self,
        certificate: Certificate,
    ) -> Certificate:

        self.db.add(certificate)
        self.db.commit()
        self.db.refresh(certificate)

        return certificate

    def get_certificate_by_id(
        self,
        certificate_id: UUID,
    ) -> Certificate | None:

        return (
            self.db.query(Certificate)
            .filter(Certificate.certificate_id == certificate_id)
            .first()
        )

    def get_restaurant_certificates(
        self,
        restaurant_id: UUID,
    ) -> list[Certificate]:

        return (
            self.db.query(Certificate)
            .filter(Certificate.restaurant_id == restaurant_id)
            .all()
        )

    def update_certificate(
        self,
        certificate: Certificate,
    ) -> Certificate:

        self.db.commit()
        self.db.refresh(certificate)

        return certificate

    def delete_certificate(
        self,
        certificate: Certificate,
    ) -> None:

        self.db.delete(certificate)
        self.db.commit()
