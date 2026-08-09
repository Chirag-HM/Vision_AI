"""
auth/models.py
SQLAlchemy ORM models for users, refresh tokens, and caregiver-user links.
"""

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, create_engine
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# ─── Role Enum ────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    BLIND_USER = "BLIND_USER"
    VOLUNTEER  = "VOLUNTEER"
    CAREGIVER  = "CAREGIVER"
    ADMIN      = "ADMIN"


# ─── User Table ───────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role            = Column(SAEnum(UserRole), nullable=False, default=UserRole.BLIND_USER)
    is_verified     = Column(Boolean, default=False, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)
    otp_code        = Column(String, nullable=True)
    otp_expires_at  = Column(DateTime, nullable=True)

    # Relationships
    refresh_tokens  = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    # For caregivers: the users they monitor
    monitored_users = relationship(
        "CaregiverLink",
        foreign_keys="CaregiverLink.caregiver_id",
        back_populates="caregiver"
    )
    # For blind users: the caregivers linked to them
    caregivers      = relationship(
        "CaregiverLink",
        foreign_keys="CaregiverLink.user_id",
        back_populates="linked_user"
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"


# ─── Refresh Token Table ───────────────────────────────────────────────────────

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash    = Column(String, nullable=False, unique=True)  # Store sha256 of raw token
    expires_at    = Column(DateTime, nullable=False)
    is_blacklisted = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken user_id={self.user_id} blacklisted={self.is_blacklisted}>"


# ─── Caregiver Link Table ──────────────────────────────────────────────────────

class CaregiverLink(Base):
    __tablename__ = "caregiver_links"

    id           = Column(Integer, primary_key=True, index=True)
    caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    caregiver   = relationship("User", foreign_keys=[caregiver_id], back_populates="monitored_users")
    linked_user = relationship("User", foreign_keys=[user_id], back_populates="caregivers")


# ─── Database Bootstrap ────────────────────────────────────────────────────────

DATABASE_URL = "sqlite:///./smart_vision.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def init_db():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
