from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserRegister, Token
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType


class AuthService:

    def __init__(
        self,
        db: Session,
    ):
        self.user_repository = UserRepository(db)

    def register_user(
        self,
        user_data: UserRegister,
    ) -> User:

        existing_user = self.user_repository.get_user_by_email(user_data.email)

        if existing_user:
            raise ValueError("Email already registered.")

        user = User(
            name=user_data.name,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            phone_number=user_data.phone_number,
            role=user_data.role,
        )

        user = self.user_repository.create_user(user)

        # Notify admins only when a new OWNER registers
        if user.role == UserRole.OWNER:

            admins = self.user_repository.get_admins()

            for admin in admins:

                NotificationService(
                    self.user_repository.db,
                ).send(
                    user_id=admin.user_id,
                    title="New Owner Registration",
                    message=(
                        f"{user.name} has registered as a restaurant owner "
                        "and is awaiting verification."
                    ),
                    notification_type=NotificationType.INFO,
                )

        return user

    def login_user(
        self,
        email: str,
        password: str,
    ) -> Token:

        user = self.user_repository.get_user_by_email(email)

        if not user:
            raise ValueError("Invalid email or password.")

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise ValueError("Invalid email or password.")

        access_token = create_access_token(
            data={
                "sub": str(user.user_id),
                "role": user.role.value,
            }
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
        )
