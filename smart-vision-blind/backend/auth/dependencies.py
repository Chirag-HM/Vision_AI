"""
auth/dependencies.py
FastAPI dependency injection for JWT authentication and role-based access control.
"""

import hashlib
from datetime import datetime, timezone
from typing import List

from fastapi import Depends, HTTPException, status, WebSocket, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from auth.models import User, UserRole, RefreshToken
from auth.database import get_db
from auth.jwt_utils import decode_access_token

# Bearer token extractor
bearer_scheme = HTTPBearer()


# ─── JWT → User Dependency ─────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extracts and validates the JWT Bearer token from the Authorization header.
    Returns the authenticated User object or raises 401.
    """
    token = credentials.credentials
    payload = decode_access_token(token)  # Raises HTTPException on failure

    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email.",
        )
    return user


# ─── Role-Based Access Control Decorator ───────────────────────────────────────

def require_role(allowed_roles: List[UserRole]):
    """
    Factory function that returns a FastAPI dependency enforcing role restrictions.

    Usage:
        @router.get("/admin/users")
        def list_users(user: User = Depends(require_role([UserRole.ADMIN]))):
            ...
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}",
            )
        return current_user
    return role_checker


# ─── WebSocket Authentication ──────────────────────────────────────────────────

async def get_ws_user(
    token: str = Query(...),
    db: Session = Depends(get_db),
) -> User:
    """
    Authenticate a WebSocket connection via query param: ?token=<access_token>
    Closes the WebSocket with a 4001 code on failure.
    """
    payload = decode_access_token(token, raise_http=False)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired WebSocket token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="WebSocket auth failed: user not verified",
        )
    return user
