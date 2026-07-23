from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user import User, UserRole
from app.core.constants import (
    DEFAULT_RECENT_LIMIT,
)


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: User) -> User:

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def get_user_by_email(self, email: str) -> User | None:

        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: UUID) -> User | None:

        return self.db.query(User).filter(User.user_id == user_id).first()

    def update_user(self, user: User) -> User:

        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_user(self, user: User) -> None:

        self.db.delete(user)
        self.db.commit()

    def get_recent_users(
        self,
        limit: int = DEFAULT_RECENT_LIMIT,
    ):

        return (
            self.db.query(User)
            .order_by(User.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_admins(self):

        return self.db.query(User).filter(User.role == UserRole.ADMIN).all()

    def get_inspectors(self):

        return (
            self.db.query(User).filter(User.role == UserRole.INSPECTOR).all()
        )

    def get_all_users(
        self,
        search: str | None = None,
        role: str | None = None,
        page: int = 1,
        per_page: int = 50,
    ):
        query = self.db.query(User)

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                (User.name.ilike(pattern)) | (User.email.ilike(pattern))
            )

        if role:
            query = query.filter(User.role == role)

        offset = (page - 1) * per_page
        return (
            query.order_by(User.created_at.desc())
            .offset(offset)
            .limit(per_page)
            .all()
        )
