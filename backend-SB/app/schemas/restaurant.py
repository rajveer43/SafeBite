from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, AliasChoices


class RestaurantCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(
        min_length=2,
        max_length=150,
    )

    address: str = Field(
        min_length=5,
        max_length=500,
    )

    latitude: float = 0.0

    longitude: float = 0.0

    contact_number: str = Field(
        default="",
        validation_alias=AliasChoices("contact_number", "phone"),
    )

    status: str | None = "pending"


class RestaurantUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = None

    address: str | None = None

    latitude: float | None = None

    longitude: float | None = None

    contact_number: str | None = Field(
        default=None,
        validation_alias=AliasChoices("contact_number", "phone"),
    )

    status: str | None = None


class RestaurantApprovalUpdate(BaseModel):
    status: str = Field(
        ...,
        description="Approval status: 'active', 'approved', 'under_review', 'rejected', 'pending'",
    )
    notes: str | None = None


class RestaurantResponse(BaseModel):

    restaurant_id: UUID

    owner_id: UUID

    name: str

    address: str

    latitude: float

    longitude: float

    contact_number: str

    status: str = "pending"

    safety_score: Decimal | None

    assigned_inspector_id: UUID | None = None

    assigned_inspector_name: str | None = None

    created_at: datetime

    updated_at: datetime


class AssignInspectorRequest(BaseModel):
    inspector_id: UUID | None = Field(
        None,
        description="User ID of the inspector to assign, or null to unassign",
    )


class RestaurantFilter(BaseModel):

    search: Optional[str] = None

    min_score: Optional[float] = None

    max_score: Optional[float] = None

    high_risk: Optional[bool] = None
