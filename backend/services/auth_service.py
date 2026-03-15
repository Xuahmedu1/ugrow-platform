"""
UGROW Authentication Service
Handles password hashing, JWT tokens, and credential encryption
SRS 4.1, 4.3, 4.4 compliance
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple

import bcrypt
from jose import JWTError, jwt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

from sqlalchemy.orm import Session
from models import User, UserRole, UserStatus, RestaurantStatus
from database import get_db

# ============================================
# Configuration
# ============================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Encryption key for platform credentials (AES-256 via Fernet)
ENCRYPTION_KEY = os.getenv("PLATFORM_CREDENTIALS_ENCRYPTION_KEY")
if ENCRYPTION_KEY:
    # Ensure key is valid Fernet key (32 bytes, base64 encoded)
    cipher_suite = Fernet(ENCRYPTION_KEY.encode())
else:
    # Generate temporary key for development (DO NOT USE IN PRODUCTION)
    cipher_suite = Fernet(Fernet.generate_key())


# ============================================
# Authentication Service
# ============================================

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # ============================================
    # Password Hashing (bcrypt)
    # ============================================

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode(), salt)
        return hashed.decode()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(
            plain_password.encode(),
            hashed_password.encode()
        )

    # ============================================
    # JWT Token Management
    # ============================================

    def create_access_token(self, user_id: str, role: str) -> str:
        """Create short-lived access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "role": role,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())  # Unique token ID for revocation
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def create_refresh_token(self, user_id: str) -> str:
        """Create long-lived refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> Optional[dict]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Create new access token from valid refresh token"""
        payload = self.decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        
        user_id = payload.get("sub")
        user = self.db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        
        if not user or not user.is_active:
            return None
        
        return self.create_access_token(str(user.id), user.role.value)

    # ============================================
    # Authentication
    # ============================================

    def authenticate_user(self, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Authenticate user with email and password.
        Returns (user, error_message)
        """
        # Validate email domain per SRS 4.2
        if not email.endswith("@ugrow.com"):
            return None, "Invalid email domain. Must use @ugrow.com"
        
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user:
            return None, "Invalid credentials"
        
        # Check user status per SRS 4.4
        if user.status == UserStatus.HOLD:
            return None, "Your account is currently on hold. Please contact UGROW."
        
        if user.status == UserStatus.DEACTIVATED:
            return None, "Your account has been deactivated. Please contact UGROW."
        
        if not self.verify_password(password, user.password_hash):
            return None, "Invalid credentials"
        
        # Check restaurant status for client users
        if user.role == UserRole.CLIENT and user.restaurant:
            if user.restaurant.status == RestaurantStatus.HOLD:
                return None, "Your restaurant account is currently on hold. Please contact UGROW."
            if user.restaurant.status == RestaurantStatus.DEACTIVATED:
                return None, "Your restaurant account has been deactivated. Please contact UGROW."
        
        return user, None
    # Import here to avoid circular dependency

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to get current authenticated user.
    Use in protected routes: user: User = Depends(get_current_user_dependency)
    """
    token = credentials.credentials
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )

    return user

async def get_current_admin(
    user: User = Depends(get_current_user_dependency)
) -> User:
    """
    FastAPI dependency to ensure user is admin.
    """
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user