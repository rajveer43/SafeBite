from uuid import UUID

import phonenumbers
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)
from datetime import datetime

from app.enums.user_role import UserRole


class UserRegister(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100
    )

    phone_number: str

    role: UserRole

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        try:
            number = phonenumbers.parse(value, "IN")

            if not phonenumbers.is_valid_number(number):
                raise ValueError

            return phonenumbers.format_number(
                number,
                phonenumbers.PhoneNumberFormat.E164
            )

        except Exception:
            raise ValueError("Invalid phone number")
        
    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):

        if len(value) < 8:
            raise ValueError(
            "Password must be at least 8 characters."
        )

        if not any(c.isupper() for c in value):
            raise ValueError(
            "Password must contain one uppercase letter."
        )

        if not any(c.islower() for c in value):
            raise ValueError(
            "Password must contain one lowercase letter."
        )

        if not any(c.isdigit() for c in value):
            raise ValueError(
            "Password must contain one number."
        )

        return value


class UserLogin(BaseModel):
    email: EmailStr

    password: str


class Token(BaseModel):
    access_token: str

    token_type: str


class UserResponse(BaseModel):
    user_id: UUID

    name: str

    email: EmailStr

    phone_number: str

    role: UserRole

    is_active: bool

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )