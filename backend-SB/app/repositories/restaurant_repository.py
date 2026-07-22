from uuid import UUID

from sqlalchemy.orm import Session

from app.models.restaurant import Restaurant
from geoalchemy2.functions import ST_DWithin, ST_Distance
from sqlalchemy import func, or_, asc, desc


class RestaurantRepository:

    def __init__(
        self,
        db: Session
    ):
        self.db = db

    def create_restaurant(
        self,
        restaurant: Restaurant
    ) -> Restaurant:

        self.db.add(restaurant)
        self.db.commit()
        self.db.refresh(restaurant)

        return restaurant

    def get_restaurant_by_id(
        self,
        restaurant_id: UUID
    ) -> Restaurant | None:

        return (
            self.db.query(Restaurant)
            .filter(
                Restaurant.restaurant_id == restaurant_id
            )
            .first()
        )

    def get_restaurants(self) -> list[Restaurant]:

        return (
            self.db.query(Restaurant)
            .all()
        )

    def get_restaurants_by_owner(
        self,
        owner_id: UUID,
    ) -> list[Restaurant]:

        return (
            self.db.query(Restaurant)
            .filter(
                Restaurant.owner_id == owner_id
            )
            .all()
        )

    def get_restaurant_by_owner(
        self,
        restaurant_id: UUID,
        owner_id: UUID,
    ) -> Restaurant | None:

        return (
            self.db.query(Restaurant)
            .filter(
                Restaurant.restaurant_id == restaurant_id,
                Restaurant.owner_id == owner_id,
            )
            .first()
        )

    def update_restaurant(
        self,
        restaurant: Restaurant
    ) -> Restaurant:

        self.db.commit()
        self.db.refresh(restaurant)

        return restaurant

    def delete_restaurant(
        self,
        restaurant: Restaurant
    ) -> None:

        self.db.delete(restaurant)
        self.db.commit()

    def get_nearby_restaurants(
        self,
        latitude: float,
        longitude: float,
        radius: float,
    ):
        return (
            self.db.query(Restaurant)
            .filter(
                ST_DWithin(
                    func.Geography(Restaurant.location),
                    func.ST_GeogFromText(
                        f"SRID=4326;POINT({longitude} {latitude})"
                    ),
                    radius * 1000,
                )
            )
            .all()
        )

    def update_safety_score(
        self,
        restaurant: Restaurant,
        safety_score: float,
    ) -> Restaurant:

        restaurant.safety_score = safety_score

        self.db.commit()
        self.db.refresh(restaurant)

        return restaurant
    
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

        query = self.db.query(Restaurant)

        if search:

            query = query.filter(

                or_(

                    Restaurant.name.ilike(
                        f"%{search}%"
                    ),

                    Restaurant.address.ilike(
                        f"%{search}%"
                    ),

                )

            )

        if min_score is not None:

            query = query.filter(
                Restaurant.safety_score >= min_score
            )

        if max_score is not None:

            query = query.filter(
                Restaurant.safety_score <= max_score
            )

        if high_risk:

            query = query.filter(
                Restaurant.safety_score < 40
            )

        # Sorting

        if sort_by == "score":

            query = query.order_by(
                desc(Restaurant.safety_score)
            )

        elif sort_by == "name":

            query = query.order_by(
                asc(Restaurant.name)
            )

        elif sort_by == "newest":

            query = query.order_by(
                desc(Restaurant.created_at)
            )

        else:

            query = query.order_by(
                Restaurant.created_at.desc()
            )

        # Pagination

        offset = (page - 1) * limit

        query = query.offset(
            offset
        ).limit(
            limit
        )

        return query.all()