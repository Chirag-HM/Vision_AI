"""
models/caregiver.py
Beanie Document model for the 'caregiver_links' collection.
Links a CAREGIVER user to the BLIND_USER they monitor.
"""

from datetime import datetime, timezone
from beanie import Document, Indexed
from beanie import PydanticObjectId
from pydantic import Field


class CaregiverLink(Document):
    caregiver_id: Indexed(PydanticObjectId)  # type: ignore[valid-type]
    user_id:      Indexed(PydanticObjectId)  # type: ignore[valid-type]
    linked_at:    datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "caregiver_links"
