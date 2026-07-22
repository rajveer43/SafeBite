from fastapi import Depends, HTTPException, status

from app.dependencies.auth import get_current_user
from app.enums.user_role import UserRole
from app.enums.verification_status import VerificationStatus
from app.models.user import User

def require_owner(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.OWNER:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can perform this action."
        )

    return current_user

def require_verified_owner(
    current_user: User = Depends(
        get_current_user,
    ),
) -> User:

    if current_user.role != UserRole.OWNER:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only restaurant owners can access this endpoint.",
        )

    if (
        current_user.verification_status
        == VerificationStatus.REJECTED
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your owner account verification was rejected by an administrator.",
        )

    return current_user

def require_customer(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.CUSTOMER:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can perform this action."
        )

    return current_user


def require_inspector(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.INSPECTOR:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only inspectors can perform this action."
        )

    return current_user

def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.ADMIN:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can perform this action."
        )

    return current_user