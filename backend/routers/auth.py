from fastapi import APIRouter, HTTPException # type: ignore
from pydantic import BaseModel # type: ignore
from datetime import datetime, timedelta
from jose import jwt # type: ignore
import hashlib

router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY         = "ugrow-secret-key-change-in-production"
ALGORITHM          = "HS256"
TOKEN_EXPIRE_HOURS = 24

# ── Simple password hashing (SHA256 — replace with bcrypt in production) ─────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed

# ── Mock users ────────────────────────────────────────────────────────────────
MOCK_USERS = {
    "admin@ugrow.com": {
        "id": "1",
        "email": "admin@ugrow.com",
        "name": "Admin",
        "role": "admin",
        "status": "active",
        "hashed_password": hash_password("admin123"),
    },
    "client@ugrow.com": {
        "id": "2",
        "email": "client@ugrow.com",
        "name": "Client",
        "role": "client",
        "status": "active",
        "restaurantId": "1",
        "hashed_password": hash_password("client123"),
    },
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# ── Helpers ───────────────────────────────────────────────────────────────────
def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    user = MOCK_USERS.get(body.email)

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user["status"] == "hold":
        raise HTTPException(status_code=403, detail="Your account is on hold")

    if user["status"] == "deactivated":
        raise HTTPException(status_code=403, detail="Your account has been deactivated")

    token = create_token({"sub": user["email"], "role": user["role"]})
    user_data = {k: v for k, v in user.items() if k != "hashed_password"}

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data,
    )

@router.get("/me")
def get_me():
    return {"message": "Not implemented yet"}