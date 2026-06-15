"""
auth/jwt_utils.py
Utility functions for creating and decoding JWT access/refresh tokens.
"""

import os
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import HTTPException, status

# ─── Configuration ─────────────────────────────────────────────────────────────
# In production, load from environment variables

SECRET_KEY       = os.getenv("JWT_SECRET_KEY", "super-secret-smart-vision-key-change-me")
ALGORITHM        = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES  = 15
REFRESH_TOKEN_EXPIRE_DAYS    = 7


# ─── Token Creation ────────────────────────────────────────────────────────────

def create_access_token(user_id: int, role: str) -> str:
    """Creates a short-lived JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    """Creates a long-lived JWT refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─── Token Decoding ────────────────────────────────────────────────────────────

def decode_access_token(token: str, raise_http: bool = True) -> Optional[dict]:
    """
    Decodes and validates a JWT access token.
    If raise_http=True, raises FastAPI HTTPException on invalid token.
    If raise_http=False, returns None on failure (useful for WebSocket auth).
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        if payload.get("type") != "access":
            raise JWTError("Not an access token")
        return payload
    except JWTError:
        if raise_http:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decodes a JWT refresh token. Returns None on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_sub": False})
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


# ─── Token Hash ────────────────────────────────────────────────────────────────

def hash_token(token: str) -> str:
    """SHA-256 hash a raw token before storing it in the database."""
    return hashlib.sha256(token.encode()).hexdigest()
