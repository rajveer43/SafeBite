from pydantic import BaseModel

from app.enums.verification_status import VerificationStatus


class VerificationStatusUpdate(BaseModel):

    verification_status: VerificationStatus
