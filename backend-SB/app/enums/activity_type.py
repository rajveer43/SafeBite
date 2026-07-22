from enum import Enum


class ActivityType(str, Enum):
    USER = "User"
    RESTAURANT = "Restaurant"
    INSPECTION = "Inspection"
    COMPLAINT = "Complaint"
    CERTIFICATE = "Certificate"
    SAFETY_SCORE = "Safety Score"
    AUTHENTICATION = "Authentication"
    ADMIN = "Admin"