from enum import Enum


class UserRole(str, Enum): 
    CUSTOMER = "customer"
    OWNER = "owner"
    INSPECTOR = "inspector"
    ADMIN = "admin"

# Because FastAPI and Pydantic work much better with string enums. 
# Later, when a user registers, they can send a string value for the role, and 
# Pydantic will automatically validate it against the UserRole enum.

