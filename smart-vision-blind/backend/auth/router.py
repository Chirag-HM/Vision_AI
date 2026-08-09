"""
auth/router.py
FastAPI router implementing: register, verify email (OTP), login, refresh, logout.
"""

import secrets
import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from auth.models import User, UserRole, RefreshToken
from auth.database import get_db
from auth.jwt_utils import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_token,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from auth.dependencies import get_current_user
from auth.email_service import generate_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OTP validity duration
OTP_EXPIRE_MINUTES = 5


# ─── Pydantic Schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.BLIND_USER

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOtpRequest(BaseModel):
    email: EmailStr

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int

class MessageResponse(BaseModel):
    message: str


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def _set_refresh_cookie(response: Response, token: str):
    """Store the refresh token in a secure httpOnly cookie."""
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=False,        # Set True in production (HTTPS)
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/auth/refresh",
    )

def _generate_and_store_otp(user: User, db: Session) -> str:
    """Generate an OTP, store it on the user record, and return it."""
    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    db.commit()
    return otp


# ─── POST /auth/register ───────────────────────────────────────────────────────

@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user with email, password, and role.
    Generates a 6-digit OTP and sends it to the user's email for verification.
    """
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed_pw = _hash_password(req.password)
    user = User(email=req.email, hashed_password=hashed_pw, role=req.role)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate and send OTP
    otp = _generate_and_store_otp(user, db)
    send_otp_email(user.email, otp)

    print(f"[Auth] Registered user {user.email} as {user.role} — OTP sent")
    return {"message": "OTP sent to your email. Please verify to continue."}


# ─── POST /auth/verify-otp ────────────────────────────────────────────────────

@router.post("/verify-otp", response_model=MessageResponse)
def verify_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verify the OTP sent to the user's email during registration.
    Marks the user as verified on success.
    """
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email.",
        )

    if user.is_verified:
        return {"message": "Email is already verified. You can log in."}

    # Check OTP exists
    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found. Please request a new one.",
        )

    # Check OTP expiry (handle SQLite naive datetime issue)
    expires_at = user.otp_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        # Clear expired OTP
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="OTP has expired. Please request a new one.",
        )

    # Check OTP match
    if req.otp.strip() != user.otp_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP. Please try again.",
        )

    # ✓ OTP valid — mark user as verified
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    print(f"[Auth] ✓ Email verified: {user.email}")
    return {"message": "Email verified successfully! You can now log in."}


# ─── POST /auth/resend-otp ────────────────────────────────────────────────────

@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(req: ResendOtpRequest, db: Session = Depends(get_db)):
    """
    Generate a new OTP and resend it to the user's email.
    """
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email.",
        )

    if user.is_verified:
        return {"message": "Email is already verified. You can log in."}

    # Generate and send a new OTP
    otp = _generate_and_store_otp(user, db)
    send_otp_email(user.email, otp)

    print(f"[Auth] Resent OTP to {user.email}")
    return {"message": "A new OTP has been sent to your email."}


# ─── POST /auth/login ─────────────────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse)
def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate with email + password.
    Returns a short-lived JWT access token in the body and a
    long-lived refresh token in a secure httpOnly cookie.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not _verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in.",
        )

    # Create tokens
    access_token  = create_access_token(user_id=user.id, role=user.role.value)
    refresh_token = create_refresh_token(user_id=user.id)

    # Persist hashed refresh token in DB
    token_hash = hash_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    db_token = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(db_token)
    db.commit()

    # Set refresh token in httpOnly cookie
    _set_refresh_cookie(response, refresh_token)

    print(f"[Auth] Login: {user.email} ({user.role})")
    return LoginResponse(
        access_token=access_token,
        role=user.role.value,
        user_id=user.id,
    )


# ─── POST /auth/refresh ───────────────────────────────────────────────────────

@router.post("/refresh", response_model=LoginResponse)
def refresh_token_endpoint(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    """
    Exchange a valid refresh token cookie for a new access token.
    Rotates the refresh token (old one is blacklisted).
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token cookie provided",
        )

    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    token_hash = hash_token(refresh_token)
    db_token = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    if not db_token or db_token.is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked or not found",
        )
    # Ensure tz-aware comparison
    expires_at = db_token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Blacklist old token and issue a new one (rotation)
    db_token.is_blacklisted = True
    new_refresh_token = create_refresh_token(user_id=user.id)
    new_expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh_token),
        expires_at=new_expires_at
    )
    db.add(new_db_token)
    db.commit()

    new_access_token = create_access_token(user_id=user.id, role=user.role.value)
    _set_refresh_cookie(response, new_refresh_token)

    return LoginResponse(
        access_token=new_access_token,
        role=user.role.value,
        user_id=user.id,
    )


# ─── POST /auth/logout ────────────────────────────────────────────────────────

@router.post("/logout", response_model=MessageResponse)
def logout(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Blacklist the refresh token in the DB and clear the cookie.
    Requires a valid access token in the Authorization header.
    """
    if refresh_token:
        token_hash = hash_token(refresh_token)
        db_token = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if db_token:
            db_token.is_blacklisted = True
            db.commit()

    # Clear cookie
    response.delete_cookie(key="refresh_token", path="/auth/refresh")
    print(f"[Auth] Logout: {current_user.email}")
    return {"message": "Logged out successfully."}


# ─── GET /auth/me ─────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_verified": current_user.is_verified,
    }
