import os
import sys

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.database.database import SessionLocal
from app.models.user import User
from app.enums.user_role import UserRole
from app.core.security import hash_password


def seed_admin():

    db = SessionLocal()

    try:

        existing_admin = (
            db.query(User).filter(User.role == UserRole.ADMIN).first()
        )

        if existing_admin:

            print("✅ Admin already exists.")
            return

        admin = User(
            name="System Administrator",
            email="admin@safebite.com",
            password_hash=hash_password("SafeBite@Admin2026#"),
            phone_number="8780584947",
            role=UserRole.ADMIN,
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("✅ Admin created successfully!")
        print("Email: admin@safebite.com")
        print("Password: SafeBite@Admin2026#")

    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
