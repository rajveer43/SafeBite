from enum import Enum


class ComplaintStatus(str, Enum):
    PENDING = "pending"
    UNDER_INVESTIGATION = "under_investigation"
    RESOLVED = "resolved"
