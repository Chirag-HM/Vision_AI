"""
auth/database.py
SQLAlchemy session management and DB dependency injection.
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from auth.models import Base

DATABASE_URL = "sqlite:///./smart_vision.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all DB tables on startup and migrate new columns if needed."""
    Base.metadata.create_all(bind=engine)

    # Auto-migrate: add OTP columns if they don't exist yet
    inspector = inspect(engine)
    existing_columns = {col["name"] for col in inspector.get_columns("users")}

    with engine.begin() as conn:
        if "otp_code" not in existing_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR"))
            print("[DB] Migrated: added 'otp_code' column to users table")
        if "otp_expires_at" not in existing_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires_at DATETIME"))
            print("[DB] Migrated: added 'otp_expires_at' column to users table")


def get_db():
    """FastAPI dependency that yields a DB session and ensures it's closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

