"""Remove seeded test users and related data, keeping admin and real registrations."""

import os
import re
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database.database import SessionLocal
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.inspection import Inspection
from app.models.complaint import Complaint
from app.models.certificate import Certificate
from app.models.notification import Notification
from app.models.safety_score import SafetyScore
from app.enums.user_role import UserRole

TEST_USER_EMAIL = re.compile(
    r"^(customer|owner|inspector)\d+@safebite\.com$",
    re.IGNORECASE,
)


def clear_test_data():
    db = SessionLocal()

    try:
        test_users = [
            user
            for user in db.query(User)
            .filter(User.role != UserRole.ADMIN)
            .all()
            if TEST_USER_EMAIL.match(user.email)
        ]

        if not test_users:
            print("No seeded test users found.")
            return

        test_user_ids = [u.user_id for u in test_users]

        owner_restaurant_ids = [
            r.restaurant_id
            for r in db.query(Restaurant)
            .filter(Restaurant.owner_id.in_(test_user_ids))
            .all()
        ]

        if owner_restaurant_ids:
            db.query(Inspection).filter(
                Inspection.restaurant_id.in_(owner_restaurant_ids)
            ).delete(synchronize_session=False)
            db.query(Complaint).filter(
                Complaint.restaurant_id.in_(owner_restaurant_ids)
            ).delete(synchronize_session=False)
            db.query(Certificate).filter(
                Certificate.restaurant_id.in_(owner_restaurant_ids)
            ).delete(synchronize_session=False)
            db.query(SafetyScore).filter(
                SafetyScore.restaurant_id.in_(owner_restaurant_ids)
            ).delete(synchronize_session=False)
            db.query(Restaurant).filter(
                Restaurant.restaurant_id.in_(owner_restaurant_ids)
            ).delete(synchronize_session=False)

        db.query(Inspection).filter(
            Inspection.inspector_id.in_(test_user_ids)
        ).delete(synchronize_session=False)
        db.query(Complaint).filter(
            Complaint.customer_id.in_(test_user_ids)
        ).delete(synchronize_session=False)
        db.query(Notification).filter(
            Notification.user_id.in_(test_user_ids)
        ).delete(synchronize_session=False)

        for user in test_users:
            db.delete(user)

        db.commit()

        print(f"Removed {len(test_users)} test user(s):")
        for user in test_users:
            print(f"  - {user.email} ({user.role.value})")

        remaining = db.query(User).count()
        print(f"{remaining} user(s) remaining in database.")

    except Exception as e:
        db.rollback()
        print(f"Error clearing test data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    clear_test_data()
