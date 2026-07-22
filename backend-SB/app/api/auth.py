from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import traceback
from fastapi.security import OAuth2PasswordRequestForm

from app.database.session import get_db
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
)
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.roles import require_owner, require_customer, require_inspector

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    try:
        return service.register_user(user)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=Token,
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    service = AuthService(db)

    try:

        return service.login_user(
            email=user.email,
            password=user.password,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_logged_in_user(
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.get("/owner-test")
def owner_test(

    owner: User = Depends(require_owner)

):
    return {
        "message": f"Welcome {owner.name}. You are an owner."
    }

@router.get("/customer-test")
def customer_test(
    customer: User = Depends(require_customer),
):
    return {
        "message": f"Welcome {customer.name}. You are a customer."
    }


@router.get("/inspector-test")
def inspector_test(
    inspector: User = Depends(require_inspector),
):
    return {
        "message": f"Welcome {inspector.name}. You are an inspector."
    }