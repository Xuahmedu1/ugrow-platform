from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserStatus, UserRole
from services.auth_service import AuthService

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# ── Routes ───────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    
    # Authenticate
    user, error = auth_service.authenticate_user(body.email, body.password)
    
    if error:
        if "hold" in error.lower():
            raise HTTPException(status_code=403, detail=error)
        if "deactivated" in error.lower():
            raise HTTPException(status_code=403, detail=error)
        raise HTTPException(status_code=401, detail=error)
    
    # Create tokens
    access_token = auth_service.create_access_token(str(user.id), user.role.value)
    
    # Build user response
    user_data = {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role.value,
        "status": user.status.value,
        "restaurantId": str(user.restaurant_id) if user.restaurant_id else None,
    }
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_data,
    )

@router.get("/me")
def get_me():
    return {"message": "Use /api/auth/login to authenticate"}

@router.post("/refresh")
def refresh_token():
    """Token refresh - placeholder"""
    raise HTTPException(status_code=501, detail="Not implemented yet")