"""
models/user.py
Beanie Document model for the 'users' collection.
"""

import enum
from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class UserRole(str, enum.Enum):
    BLIND_USER = "BLIND_USER"
    VOLUNTEER  = "VOLUNTEER"
    CAREGIVER  = "CAREGIVER"
    ADMIN      = "ADMIN"


class User(Document):
    email:           Indexed(EmailStr, unique=True)  # type: ignore[valid-type]
    hashed_password: str
    role:            UserRole = UserRole.BLIND_USER
    is_verified:     bool     = False
    full_name:       str      = ""
    phone:           str      = ""
    city:            str      = ""
    created_at:      datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at:      datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"  # MongoDB collection name

    class Config:
        # Allow population by alias (Pydantic v1 compat)
        populate_by_name = True

    def __repr__(self) -> str:
        return f"<User {self.email} [{self.role}]>"
