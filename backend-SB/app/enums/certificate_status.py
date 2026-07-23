from enum import Enum


class CertificateStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"
