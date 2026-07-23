from datetime import date

from app.core.constants import (
    INSPECTION_OVERDUE_DAYS,
)


class AdminMapper:

    @staticmethod
    def recent_restaurant(
        restaurant,
    ):

        return {
            "restaurant_id": restaurant.restaurant_id,
            "name": restaurant.name,
            "owner": restaurant.owner.name,
            "contact_number": restaurant.contact_number,
            "safety_score": restaurant.safety_score,
            "created_at": restaurant.created_at,
        }

    @staticmethod
    def recent_user(
        user,
    ):

        return {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
            "created_at": user.created_at,
        }

    @staticmethod
    def pending_complaint(
        complaint,
    ):

        return {
            "complaint_id": complaint.complaint_id,
            "customer": complaint.customer.name,
            "restaurant": complaint.restaurant.name,
            "category": complaint.category,
            "status": complaint.status.value,
            "created_at": complaint.created_at,
        }

    @staticmethod
    def pending_certificate(
        certificate,
    ):

        return {
            "certificate_id": certificate.certificate_id,
            "restaurant": certificate.restaurant.name,
            "certificate_type": certificate.certificate_type.value,
            "certificate_number": certificate.certificate_number,
            "uploaded_on": certificate.issue_date,
            "status": certificate.status.value,
        }

    @staticmethod
    def overdue_inspection(
        restaurant,
        last_inspection,
    ):

        today = date.today()

        return {
            "restaurant_id": restaurant.restaurant_id,
            "restaurant": restaurant.name,
            "owner": restaurant.owner.name,
            "last_inspection": last_inspection,
            "days_overdue": (today - last_inspection).days
            - INSPECTION_OVERDUE_DAYS,
        }

    @staticmethod
    def pending_owner(
        owner,
    ):

        return {
            "user_id": owner.user_id,
            "name": owner.name,
            "email": owner.email,
            "phone_number": owner.phone_number,
            "registered_at": owner.created_at,
        }

    @staticmethod
    def verification_status_updated(
        user,
    ):

        return {
            "user_id": user.user_id,
            "name": user.name,
            "role": user.role.value,
            "verification_status": user.verification_status.value.title(),
        }
