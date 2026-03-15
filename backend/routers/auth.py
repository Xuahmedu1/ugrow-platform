from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt
import hashlib

router = APIRouter()

# ── Config ──────────────────────────────────────────────────────
SECRET_KEY         = "ugrow-secret-key-change-in-production"
ALGORITHM          = "HS256"
TOKEN_EXPIRE_HOURS = 24

# ── Password hashing ────────────────────────────────────────────
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed

# ── Mock users ──────────────────────────────────────────────────
MOCK_USERS = {
    "admin@ugrow.com": {
        "id": "admin-1",
        "email": "admin@ugrow.com",
        "name": "UGROW Admin",
        "role": "admin",
        "status": "active",
        "hashed_password": hash_password("ugrow1@@"),
    },
    "sharea@ugrow.com": {
        "id": "client-rest-1",
        "email": "sharea@ugrow.com",
        "name": "Sharea Alkebda",
        "role": "client",
        "status": "active",
        "restaurantId": "rest-1",
        "hashed_password": hash_password("sharea123"),
    },
    "bites@ugrow.com": {
        "id": "client-rest-2",
        "email": "bites@ugrow.com",
        "name": "Bites Kitchen",
        "role": "client",
        "status": "active",
        "restaurantId": "rest-2",
        "hashed_password": hash_password("bites123"),
    },
    "gulf@ugrow.com": {
        "id": "client-rest-3",
        "email": "gulf@ugrow.com",
        "name": "Gulf Shawarma",
        "role": "client",
        "status": "hold",
        "restaurantId": "rest-3",
        "hashed_password": hash_password("gulf123"),
    },
    "bahar@ugrow.com": {
        "id": "client-rest-4",
        "email": "bahar@ugrow.com",
        "name": "Al Bahar Grills",
        "role": "client",
        "status": "deactivated",
        "restaurantId": "rest-4",
        "hashed_password": hash_password("bahar123"),
    },
}

# ── Schemas ──────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# ── Helpers ──────────────────────────────────────────────────────
def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ── Routes ───────────────────────────────────────────────────────
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