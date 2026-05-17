"""
models/iot_log.py
Beanie Document model for the 'iot_logs' collection.
Uses a TTL index so logs older than 30 days are automatically deleted by MongoDB.
"""

from datetime import datetime, timezone
from beanie import Document, Indexed
from beanie import PydanticObjectId
from pydantic import Field


class IotLog(Document):
    device_id: Indexed(str)           # type: ignore[valid-type]
    user_id:   PydanticObjectId
    event:     str                    # e.g. "obstacle_detected", "voice_command"
    data:      dict = {}              # flexible sensor payload
    # TTL index: MongoDB will automatically delete documents 30 days after timestamp
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "iot_logs"
        # Compound index for fast device+time range queries
        # TTL index must be created manually via MongoDB Atlas UI or pymongo:
        #   db.iot_logs.createIndex({"timestamp": 1}, {expireAfterSeconds: 2592000})
        indexes = [
            [("timestamp", 1)],
            [("device_id", 1), ("timestamp", -1)],
        ]

    @classmethod
    async def recent(cls, device_id: str, limit: int = 50) -> list["IotLog"]:
        """Return the N most recent logs for a specific device."""
        return (
            await cls.find(cls.device_id == device_id)
            .sort(-cls.timestamp)  # type: ignore[arg-type]
            .limit(limit)
            .to_list()
        )
