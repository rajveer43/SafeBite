from uuid import UUID

from sqlalchemy.orm import Session
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point
from app.models.restaurant import Restaurant
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.utils.activity_logger import log_activity
from app.enums.activity_type import ActivityType
from app.repositories.user_repository import UserRepository
from app.enums.verification_status import VerificationStatus
from app.services.notification_service import NotificationService
from app.enums.notification_type import NotificationType


class RestaurantService:
    def __init__(
        self,
        db: Session,
    ):
        self.restaurant_repository = RestaurantRepository(db)
        self.user_repository = UserRepository(db)

    def create_restaurant(
        self,
        owner_id: UUID,
        restaurant_data: RestaurantCreate,
    ) -> Restaurant:

        owner = self.user_repository.get_user_by_id(owner_id)

        if owner.verification_status == VerificationStatus.REJECTED:
            raise PermissionError(
                "Your owner account verification was rejected by an administrator."
            )

        location = from_shape(
            Point(
                restaurant_data.longitude,
                restaurant_data.latitude,
            ),
            srid=4326,
        )

        restaurant = Restaurant(
            owner_id=owner_id,
            name=restaurant_data.name,
            address=restaurant_data.address,
            location=location,
            contact_number=restaurant_data.contact_number,
            status=restaurant_data.status or "pending",
        )

        restaurant = self.restaurant_repository.create_restaurant(restaurant)

        log_activity(
            db=self.restaurant_repository.db,
            activity_type=ActivityType.RESTAURANT.value,
            message=f"{restaurant.name} registered.",
            actor_id=restaurant.owner_id,
            entity_id=restaurant.restaurant_id,
        )

        NotificationService(
            self.restaurant_repository.db,
        ).send(
            user_id=owner_id,
            title="Restaurant Registered",
            message=f"{restaurant.name} has been registered successfully.",
            notification_type=NotificationType.SUCCESS,
        )

        return self.build_restaurant_response(restaurant)

    def get_all_restaurants(self):
        restaurants = self.restaurant_repository.get_restaurants()

        return [
            self.build_restaurant_response(restaurant)
            for restaurant in restaurants
        ]

    def get_nearby_restaurants(
        self,
        latitude: float,
        longitude: float,
        radius: float,
    ):
        restaurants = self.restaurant_repository.get_nearby_restaurants(
            latitude,
            longitude,
            radius,
        )

        return [
            self.build_restaurant_response(restaurant)
            for restaurant in restaurants
        ]

    def get_restaurant(
        self,
        restaurant_id: UUID,
    ):
        restaurant = self.restaurant_repository.get_restaurant_by_id(
            restaurant_id
        )

        if not restaurant:
            raise ValueError("Restaurant not found.")

        return self.build_restaurant_response(restaurant)

    def build_restaurant_response(
        self,
        restaurant: Restaurant,
    ):

        point = to_shape(restaurant.location)

        inspector_name = None
        if getattr(restaurant, "assigned_inspector", None):
            inspector_name = restaurant.assigned_inspector.name
        elif getattr(restaurant, "assigned_inspector_id", None):
            insp_user = self.user_repository.get_user_by_id(
                restaurant.assigned_inspector_id
            )
            if insp_user:
                inspector_name = insp_user.name

        return {
            "restaurant_id": restaurant.restaurant_id,
            "owner_id": restaurant.owner_id,
            "name": restaurant.name,
            "address": restaurant.address,
            "latitude": point.y,
            "longitude": point.x,
            "contact_number": restaurant.contact_number,
            "status": getattr(restaurant, "status", "pending") or "pending",
            "safety_score": restaurant.safety_score,
            "assigned_inspector_id": getattr(
                restaurant, "assigned_inspector_id", None
            ),
            "assigned_inspector_name": inspector_name,
            "created_at": restaurant.created_at,
            "updated_at": restaurant.updated_at,
        }

    def update_restaurant(
        self,
        restaurant_id: UUID,
        owner_id: UUID,
        restaurant_data: RestaurantCreate,
    ):

        restaurant = self.restaurant_repository.get_restaurant_by_id(
            restaurant_id
        )

        owner = self.user_repository.get_user_by_id(owner_id)

        if owner.verification_status == VerificationStatus.REJECTED:
            raise PermissionError(
                "Your owner account verification was rejected by an administrator."
            )

        if not restaurant:
            raise ValueError("Restaurant not found.")

        if restaurant.owner_id != owner_id:
            raise PermissionError("You don't own this restaurant.")

        restaurant.name = restaurant_data.name
        restaurant.address = restaurant_data.address
        restaurant.location = from_shape(
            Point(
                restaurant_data.longitude,
                restaurant_data.latitude,
            ),
            srid=4326,
        )
        restaurant.contact_number = restaurant_data.contact_number

        restaurant = self.restaurant_repository.update_restaurant(restaurant)

        return self.build_restaurant_response(restaurant)

    def delete_restaurant(
        self,
        restaurant_id: UUID,
        owner_id: UUID,
    ):

        restaurant = self.restaurant_repository.get_restaurant_by_id(
            restaurant_id
        )

        if not restaurant:
            raise ValueError("Restaurant not found.")

        if restaurant.owner_id != owner_id:
            raise PermissionError("You don't own this restaurant.")

        self.restaurant_repository.delete_restaurant(restaurant)

    def get_my_restaurants(
        self,
        owner_id: UUID,
    ):
        restaurants = self.restaurant_repository.get_restaurants_by_owner(
            owner_id
        )

        return [
            self.build_restaurant_response(restaurant)
            for restaurant in restaurants
        ]

    def search_restaurants(
        self,
        search: str | None = None,
        min_score: float | None = None,
        max_score: float | None = None,
        high_risk: bool | None = None,
        sort_by: str | None = None,
        page: int = 1,
        limit: int = 10,
    ):

        restaurants = self.restaurant_repository.search_restaurants(
            search,
            min_score,
            max_score,
            high_risk,
            sort_by,
            page,
            limit,
        )

        return [
            self.build_restaurant_response(restaurant)
            for restaurant in restaurants
        ]

    def update_restaurant_status(
        self,
        restaurant_id: UUID,
        status_value: str,
        actor_id: UUID,
        notes: str | None = None,
    ):
        restaurant = self.restaurant_repository.get_restaurant_by_id(
            restaurant_id
        )
        if not restaurant:
            raise ValueError("Restaurant not found.")

        restaurant.status = status_value
        updated = self.restaurant_repository.update_restaurant(restaurant)

        log_activity(
            db=self.restaurant_repository.db,
            activity_type=ActivityType.RESTAURANT.value,
            message=f"{restaurant.name} status updated to '{status_value}' by inspector.",
            actor_id=actor_id,
            entity_id=restaurant.restaurant_id,
        )

        try:
            NotificationService(self.user_repository.db).send(
                user_id=restaurant.owner_id,
                title="Establishment Status Updated",
                message=f"Your restaurant '{restaurant.name}' status has been updated to '{status_value}' by the inspector."
                + (f" Note: {notes}" if notes else ""),
                notification_type=NotificationType.INFO,
            )
        except Exception:
            pass

        return self.build_restaurant_response(updated)

    def assign_inspector(
        self,
        restaurant_id: UUID,
        inspector_id: UUID | None,
        admin_id: UUID,
    ):
        restaurant = self.restaurant_repository.get_restaurant_by_id(
            restaurant_id
        )
        if not restaurant:
            raise ValueError("Restaurant not found.")

        inspector_name = None
        if inspector_id:
            inspector = self.user_repository.get_user_by_id(inspector_id)
            if not inspector:
                raise ValueError("Inspector user not found.")
            inspector_name = inspector.name

        restaurant.assigned_inspector_id = inspector_id
        updated = self.restaurant_repository.update_restaurant(restaurant)

        msg = (
            f"Assigned inspector '{inspector_name}' to {restaurant.name}"
            if inspector_name
            else f"Unassigned inspector from {restaurant.name}"
        )

        log_activity(
            db=self.restaurant_repository.db,
            activity_type=ActivityType.RESTAURANT.value,
            message=msg,
            actor_id=admin_id,
            entity_id=restaurant.restaurant_id,
        )

        if inspector_id:
            try:
                NotificationService(self.user_repository.db).send(
                    user_id=inspector_id,
                    title="New Restaurant Verification Assigned",
                    message=f"You have been assigned to verify '{restaurant.name}' located at {restaurant.address}.",
                    notification_type=NotificationType.INFO,
                )
            except Exception:
                pass

        return self.build_restaurant_response(updated)
