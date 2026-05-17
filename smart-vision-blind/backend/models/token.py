"""
models/token.py
Beanie Document model for the 'refresh_tokens' collection.
"""

from datetime import datetime, timezone
from beanie import Document, Indexed
from beanie import PydanticObjectId
from pydantic import Field


class RefreshToken(Document):
    user_id:       Indexed(PydanticObjectId)  # type: ignore[valid-type]
    token_hash:    str          # SHA-256 of the raw token
    expires_at:    datetime
    is_blacklisted: bool = False

    class Settings:
        name = "refresh_tokens"
