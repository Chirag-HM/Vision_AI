"""
models/device.py
Beanie Document models for 'devices' and 'sos_events' collections.
Location fields use GeoJSON Point format for 2dsphere geospatial queries.
"""

import enum
from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from beanie import PydanticObjectId
from pydantic import Field


class GeoPoint(dict):
    """
    GeoJSON Point helper.
    Usage: GeoPoint.create(lat=12.97, lng=77.60)
    MongoDB 2dsphere indexes require { type: "Point", coordinates: [lng, lat] }
    """
    @classmethod
    def create(cls, lat: float, lng: float) -> dict:
        return {"type": "Point", "coordinates": [lng, lat]}

    @classmethod
    def to_latlon(cls, geo: dict) -> tuple[float, float]:
        """Returns (lat, lng) from a stored GeoJSON Point."""
        lng, lat = geo["coordinates"]
        return lat, lng


class Device(Document):
    user_id:   Indexed(PydanticObjectId)  # type: ignore[valid-type]
    device_id: Indexed(str, unique=True)  # type: ignore[valid-type]
    is_online: bool     = False
    battery:   int      = 100           # 0–100 %
    location:  dict     = Field(         # GeoJSON Point
        default_factory=lambda: GeoPoint.create(lat=12.9750, lng=77.6070)
    )
    last_seen: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "devices"
        # Create a 2dsphere index on 'location' for geospatial queries
        indexes = [
            [("location", "2dsphere")],
        ]


class SOSEvent(Document):
    user_id:              Indexed(PydanticObjectId)  # type: ignore[valid-type]
    location:             dict = Field(
        default_factory=lambda: GeoPoint.create(lat=12.9750, lng=77.6070)
    )
    triggered_at:         datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    cancelled_at:         Optional[datetime] = None
    is_active:            bool = True
    notified_caregivers:  list[PydanticObjectId] = []

    class Settings:
        name = "sos_events"
