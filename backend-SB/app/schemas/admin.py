from pydantic import BaseModel


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_customers: int
    total_owners: int
    total_inspectors: int
    total_admins: int

    total_restaurants: int

    total_inspections: int

    total_complaints: int
    pending_complaints: int
    under_investigation_complaints: int
    resolved_complaints: int

    total_certificates: int
    verified_certificates: int
    expired_certificates: int

    average_safety_score: float

    high_risk_restaurants: int