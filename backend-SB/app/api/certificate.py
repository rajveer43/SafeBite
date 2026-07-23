import os
import uuid
from datetime import date
from uuid import UUID
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status,
)
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.enums.certificate_type import CertificateType
from app.enums.user_role import UserRole
from app.schemas.certificate import (
    CertificateCreate,
    CertificateUpdate,
    CertificateResponse,
)
from app.services.certificate_service import (
    CertificateService,
)
from app.repositories.restaurant_repository import RestaurantRepository
from app.dependencies.roles import require_owner, require_verified_owner
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"],
)


def map_certificate_type(val: str) -> CertificateType:
    if not val:
        return CertificateType.OTHER
    val_lower = val.lower().replace(" ", "_")
    if "fssai" in val_lower:
        return CertificateType.FSSAI
    elif "fire" in val_lower:
        return CertificateType.FIRE_SAFETY
    elif "health" in val_lower:
        return CertificateType.HEALTH
    elif "hygiene" in val_lower:
        return CertificateType.HYGIENE
    else:
        for enum_item in CertificateType:
            if (
                enum_item.value == val_lower
                or enum_item.name.lower() == val_lower
            ):
                return enum_item
        return CertificateType.OTHER


@router.post(
    "",
    response_model=CertificateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_certificate(
    request: Request,
    current_user: User = Depends(require_verified_owner),
    db: Session = Depends(get_db),
):
    service = CertificateService(db)
    content_type = request.headers.get("content-type", "")

    try:
        if "multipart/form-data" in content_type:
            form = await request.form()

            cert_type_str = str(form.get("certificate_type") or "other")
            restaurant_id_str = form.get("restaurant_id")
            issued_date_str = form.get("issued_date") or form.get("issue_date")
            expiry_date_str = form.get("expiry_date")
            cert_num = str(
                form.get("certificate_number")
                or f"CERT-{uuid.uuid4().hex[:8].upper()}"
            )
            issuing_auth = str(
                form.get("issuing_authority") or "Food Safety Authority"
            )

            document_url = None
            file_obj = form.get("file")
            if (
                file_obj
                and hasattr(file_obj, "filename")
                and file_obj.filename
            ):
                os.makedirs("uploads/certificates", exist_ok=True)
                clean_filename = f"{uuid.uuid4().hex[:8]}_{file_obj.filename.replace(' ', '_')}"
                filepath = os.path.join("uploads/certificates", clean_filename)
                contents = await file_obj.read()
                with open(filepath, "wb") as f:
                    f.write(contents)
                document_url = f"/uploads/certificates/{clean_filename}"
            elif isinstance(form.get("document_url"), str):
                document_url = form.get("document_url")

            issue_date_val = (
                date.fromisoformat(str(issued_date_str))
                if issued_date_str
                else date.today()
            )
            expiry_date_val = (
                date.fromisoformat(str(expiry_date_str))
                if expiry_date_str
                else date.today()
            )

            if restaurant_id_str and str(restaurant_id_str).strip():
                rest_id = UUID(str(restaurant_id_str).strip())
            else:
                rest_repo = RestaurantRepository(db)
                owner_restaurants = rest_repo.get_restaurants_by_owner(
                    current_user.user_id
                )
                if not owner_restaurants:
                    raise HTTPException(
                        status_code=400,
                        detail="No restaurant found. Please register a restaurant first.",
                    )
                rest_id = owner_restaurants[0].restaurant_id

            cert_type_enum = map_certificate_type(cert_type_str)

            certificate_data = CertificateCreate(
                restaurant_id=rest_id,
                certificate_type=cert_type_enum,
                certificate_number=cert_num,
                issuing_authority=issuing_auth,
                issue_date=issue_date_val,
                expiry_date=expiry_date_val,
                document_url=document_url,
            )
        else:
            body = await request.json()
            certificate_data = CertificateCreate(**body)

        return service.create_certificate(
            current_user.user_id,
            certificate_data,
        )

    except HTTPException:
        raise
    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Certificate creation failed: {str(e)}",
        )


@router.get(
    "",
    response_model=list[CertificateResponse],
)
def get_all_certificates(
    restaurant_id: Optional[UUID] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CertificateService(db)

    # Owners may only see certificates for their own restaurants.
    # Inspectors/admins may see all. Any other role (e.g. customer) gets none.
    if current_user.role == UserRole.OWNER:
        owner_id = current_user.user_id
    elif current_user.role in (UserRole.INSPECTOR, UserRole.ADMIN):
        owner_id = None
    else:
        return []

    return service.get_all_certificates(
        status_filter=status,
        restaurant_id=restaurant_id,
        owner_id=owner_id,
    )


@router.get(
    "/{certificate_id}",
    response_model=CertificateResponse,
)
def get_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db),
):
    service = CertificateService(db)

    try:
        return service.get_certificate(certificate_id)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.get(
    "/restaurant/{restaurant_id}",
    response_model=list[CertificateResponse],
)
def get_restaurant_certificates(
    restaurant_id: UUID,
    db: Session = Depends(get_db),
):
    service = CertificateService(db)
    return service.get_restaurant_certificates(restaurant_id)


@router.put(
    "/{certificate_id}",
    response_model=CertificateResponse,
)
def update_certificate(
    certificate_id: UUID,
    certificate_data: CertificateUpdate,
    db: Session = Depends(get_db),
):
    service = CertificateService(db)

    try:
        return service.update_certificate(
            certificate_id,
            certificate_data,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.delete(
    "/{certificate_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_certificate(
    certificate_id: UUID,
    db: Session = Depends(get_db),
):
    service = CertificateService(db)

    try:
        service.delete_certificate(certificate_id)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
