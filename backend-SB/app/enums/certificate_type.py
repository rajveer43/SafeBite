from enum import Enum


class CertificateType(str, Enum):
    FSSAI = "fssai"
    FIRE_SAFETY = "fire_safety"
    HEALTH = "health"
    HYGIENE = "hygiene"
    OTHER = "other"
