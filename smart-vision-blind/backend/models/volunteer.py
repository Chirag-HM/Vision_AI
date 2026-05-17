"""
models/volunteer.py
Beanie Document models for 'volunteers' and 'help_requests' collections.
Volunteers have a 2dsphere index for geospatial nearest-volunteer queries.
"""

import enum
from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from beanie import PydanticObjectId
from pydantic import Field


class HelpRequestStatus(str, enum.Enum):
    PENDING   = "PENDING"
    ACTIVE    = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Volunteer(Document):
    user_id:      Indexed(PydanticObjectId, unique=True)  # type: ignore[valid-type]
    is_available: bool        = False
    city:         str         = ""
    skills:       list[str]   = []   # e.g. ["Navigation", "Reading"]
    rating:       float       = 5.0
    total_assists: int        = 0
    # GeoJSON Point for "find nearest volunteer" queries
    location:     dict        = Field(
        default_factory=lambda: {"type": "Point", "coordinates": [0.0, 0.0]}
    )

    class Settings:
        name = "volunteers"
        indexes = [
            [("location", "2dsphere")],
        ]

    @classmethod
    async def find_near(
        cls,
        lat: float,
        lng: float,
        max_distance_km: float = 5.0,
    ) -> list["Volunteer"]:
        """
        Find available volunteers within max_distance_km of (lat, lng).
        Uses MongoDB's $nearSphere operator with 2dsphere index.
        """
        max_meters = max_distance_km * 1000
        return await cls.find(
            {
                "is_available": True,
                "location": {
                    "$nearSphere": {
                        "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                        "$maxDistance": max_meters,
                    }
                },
            }
        ).to_list()


class HelpRequest(Document):
    requester_id:  Indexed(PydanticObjectId)  # type: ignore[valid-type]
    volunteer_id:  Optional[PydanticObjectId] = None
    status:        HelpRequestStatus = HelpRequestStatus.PENDING
    request_type:  str = "Navigation"
    location:      dict = Field(
        default_factory=lambda: {"type": "Point", "coordinates": [0.0, 0.0]}
    )
    created_at:    datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at:      Optional[datetime] = None

    class Settings:
        name = "help_requests"
