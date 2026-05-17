"""
core/database.py
Async MongoDB Atlas connection using Beanie ODM + Motor.
Initialized via FastAPI lifespan context manager.
"""

import os
from contextlib import asynccontextmanager
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Monkeypatch Motor AsyncIOMotorClient to support append_metadata (introduced in PyMongo 4.14+)
# This resolves a TypeError: MotorDatabase object is not callable compatibility issue with Beanie 2.1.0
def _append_metadata(self, *args, **kwargs):
    if hasattr(self.delegate, "append_metadata"):
        return self.delegate.append_metadata(*args, **kwargs)
    return None

AsyncIOMotorClient.append_metadata = _append_metadata  # type: ignore[attr-defined]

load_dotenv()

MONGODB_URL    = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME  = os.getenv("DATABASE_NAME", "smartvision")

# Module-level client (reused across requests)
_client: AsyncIOMotorClient | None = None


async def connect_db(document_models: list):
    """
    Connect to MongoDB Atlas and initialise Beanie with all document models.
    Call this once on application startup.
    """
    global _client
    _client = AsyncIOMotorClient(MONGODB_URL)
    database = _client[DATABASE_NAME]

    await init_beanie(database=database, document_models=document_models)
    print(f"[DB] Connected to MongoDB Atlas -> database: '{DATABASE_NAME}'")


async def disconnect_db():
    """Close the Motor connection pool on application shutdown."""
    global _client
    if _client:
        _client.close()
        print("[DB] MongoDB connection closed.")


@asynccontextmanager
async def lifespan(app):
    """
    FastAPI lifespan context manager.
    Import all Beanie Document models here so they're registered at startup.
    """
    from models.user      import User
    from models.token     import RefreshToken
    from models.device    import Device, SOSEvent
    from models.volunteer import Volunteer, HelpRequest
    from models.caregiver import CaregiverLink
    from models.iot_log   import IotLog

    document_models = [
        User, RefreshToken,
        Device, SOSEvent,
        Volunteer, HelpRequest,
        CaregiverLink,
        IotLog,
    ]
    await connect_db(document_models)
    yield
    await disconnect_db()
