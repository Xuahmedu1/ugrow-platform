"""
UGROW Database Models
SQLAlchemy ORM models - SQLite compatible
"""

from datetime import datetime
from enum import Enum as PyEnum
from typing import List, Optional
import uuid

from sqlalchemy import (
    create_engine,
    Column,
    String,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    JSON,
    Date,
    Boolean,
)
from sqlalchemy.types import TypeDecorator
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import func

# ============================================
# Base Configuration
# ============================================

Base = declarative_base()

# ============================================
# Helper: UUID as String for SQLite
# ============================================

class UUIDString(TypeDecorator):
    """Store UUID as string for SQLite compatibility"""
    impl = String(36)
    cache_ok = True
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return str(value)

# Use UUIDString for all ID columns (SQLite compatible)
UUIDType = UUIDString

# ============================================
# Enums (matching SRS specifications)
# ============================================

class UserRole(str, PyEnum):
    ADMIN = "admin"
    CLIENT = "client"

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    HOLD = "hold"
    DEACTIVATED = "deactivated"

class RestaurantStatus(str, PyEnum):
    ACTIVE = "active"
    HOLD = "hold"
    DEACTIVATED = "deactivated"

class PlatformType(str, PyEnum):
    TALABAT = "talabat"
    KEETA = "keeta"
    NOON = "noon"
    SMILES = "smiles"
    DELIVEROO = "deliveroo"
    CAREEM = "careem"

class CredentialType(str, PyEnum):
    PORTAL = "portal"
    TABLET = "tablet"

# ============================================
# Mixins
# ============================================

class TimestampMixin:
    """Adds created_at and updated_at timestamps"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

# ============================================
# User Model (SRS 3.1.1)
# ============================================

class User(Base, TimestampMixin):
    """
    Users table - stores both admin and client users
    Email must end with @ugrow.com per SRS 4.2
    """
    __tablename__ = "users"

    id = Column(UUIDType, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)

    # Foreign key to restaurant (NULL for admin users)
    restaurant_id = Column(UUIDType, ForeignKey("restaurants.id"), nullable=True)
    status = Column(Enum(UserStatus), nullable=False, default=UserStatus.ACTIVE)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="users", foreign_keys=[restaurant_id])
    created_reports = relationship("Report", back_populates="created_by_user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

# ============================================
# Restaurant Model (SRS 3.1.2)
# ============================================

class Restaurant(Base, TimestampMixin):
    """
    Restaurants table - stores restaurant information
    Platform array stored as JSON for SQLite compatibility
    """
    __tablename__ = "restaurants"

    id = Column(UUIDType, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)

    # Contact information
    owner_name = Column(String(200), nullable=True)
    owner_phone = Column(String(30), nullable=True)
    manager_name = Column(String(200), nullable=True)
    manager_phone = Column(String(30), nullable=True)

    # Location
    area = Column(String(200), nullable=True)
    address = Column(Text, nullable=True)
    google_maps_url = Column(Text, nullable=True)

    # Profile
    profile_image_url = Column(Text, nullable=True)  # Defaults to No_Profile.png in app

    # Platforms as JSON array (SQLite compatible)
    platforms = Column(JSON, nullable=False, default=list)

    # Status
    status = Column(Enum(RestaurantStatus), nullable=False, default=RestaurantStatus.ACTIVE)

    # Relationships
    users = relationship("User", back_populates="restaurant", foreign_keys="User.restaurant_id")
    credentials = relationship("PlatformCredential", back_populates="restaurant", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="restaurant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Restaurant(id={self.id}, name={self.name})>"

    @property
    def platform_list(self) -> List[PlatformType]:
        """Convert platform strings to PlatformType enums"""
        return [PlatformType(p) for p in self.platforms if p in PlatformType._value2member_map_]

# ============================================
# Platform Credentials Model (SRS 3.1.3)
# ============================================

class PlatformCredential(Base, TimestampMixin):
    """
    Platform credentials table - encrypted passwords per SRS 4.4
    Supports both 'portal' and 'tablet' credential types for Deliveroo
    """
    __tablename__ = "platform_credentials"

    id = Column(UUIDType, primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(UUIDType, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Enum(PlatformType), nullable=False)
    credential_type = Column(Enum(CredentialType), nullable=False, default=CredentialType.PORTAL)
    login_email = Column(Text, nullable=False)
    password_encrypted = Column(Text, nullable=False)  # AES-256 encrypted per SRS

    # Relationships
    restaurant = relationship("Restaurant", back_populates="credentials")

    def __repr__(self):
        return f"<PlatformCredential(id={self.id}, platform={self.platform})>"

# ============================================
# Report Model (SRS 3.1.4)
# ============================================

class Report(Base):
    """
    Reports table - stores analysis results as JSON
    Master sheet path references exported Excel file
    """
    __tablename__ = "reports"

    id = Column(UUIDType, primary_key=True, default=lambda: str(uuid.uuid4()))
    restaurant_id = Column(UUIDType, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUIDType, ForeignKey("users.id"), nullable=False)

    # Date range
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)

    # Platforms included in this report
    platforms_included = Column(JSON, nullable=False)

    # Full KPI results stored as JSON for flexibility
    kpi_data_json = Column(JSON, nullable=False)

    # Path to generated Excel file
    master_sheet_path = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reports")
    created_by_user = relationship("User", back_populates="created_reports")

    def __repr__(self):
        return f"<Report(id={self.id}, restaurant_id={self.restaurant_id})>"

    @property
    def label(self) -> str:
        """Generate report label: 'Report: [From Date] to [To Date]'"""
        return f"Report: {self.date_from.strftime('%d/%m/%Y')} to {self.date_to.strftime('%d/%m/%Y')}"

# ============================================
# Database Engine and Session (for compatibility)
# ============================================

def get_engine(database_url: str):
    """Create database engine with proper settings"""
    from sqlalchemy import create_engine
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    return create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False,
    )

def get_session_maker(engine):
    """Create session factory"""
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db(engine):
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)

# ============================================
# Pydantic Models for API (FastAPI integration)
# ============================================

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional as OptionalType

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = UserRole.CLIENT
    restaurant_id: OptionalType[str] = None

    @validator('email')
    def validate_ugrow_email(cls, v):
        if not v.endswith('@ugrow.com'):
            raise ValueError('Email must end with @ugrow.com')
        return v

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: UserRole
    status: UserStatus
    restaurant_id: OptionalType[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class RestaurantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    owner_name: OptionalType[str] = None
    owner_phone: OptionalType[str] = None
    manager_name: OptionalType[str] = None
    manager_phone: OptionalType[str] = None
    area: OptionalType[str] = None
    address: OptionalType[str] = None
    google_maps_url: OptionalType[str] = None
    platforms: List[PlatformType]
    status: RestaurantStatus = RestaurantStatus.ACTIVE

class RestaurantResponse(BaseModel):
    id: str
    name: str
    owner_name: OptionalType[str]
    owner_phone: OptionalType[str]
    manager_name: OptionalType[str]
    manager_phone: OptionalType[str]
    area: OptionalType[str]
    address: OptionalType[str]
    google_maps_url: OptionalType[str]
    profile_image_url: OptionalType[str]
    platforms: List[str]
    status: RestaurantStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PlatformCredentialCreate(BaseModel):
    platform: PlatformType
    credential_type: CredentialType = CredentialType.PORTAL
    login_email: str
    password: str  # Plain text, will be encrypted before storage

class PlatformCredentialResponse(BaseModel):
    id: str
    platform: PlatformType
    credential_type: CredentialType
    login_email: str
    # Password is never returned in plain text - only for admin view with decryption
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    restaurant_id: str
    date_from: datetime
    date_to: datetime
    platforms_included: List[PlatformType]
    kpi_data: dict  # Full KPI results
    settings: dict  # Analysis settings used

class ReportResponse(BaseModel):
    id: str
    restaurant_id: str
    restaurant_name: str  # Joined from restaurant
    created_by: str
    date_from: datetime
    date_to: datetime
    platforms_included: List[str]
    kpi_data_json: dict
    master_sheet_path: OptionalType[str]
    created_at: datetime

    class Config:
        from_attributes = True

# KPI Result Schema (matches frontend types)
class KPIResultSchema(BaseModel):
    numOrders: int
    totalSales: float
    discount: float
    earnings: float
    actualSales: float
    netRevenue: float
    expenses: float
    difference: float
    foodCost: float
    differenceCost: float

class PlatformKPIResultSchema(BaseModel):
    platform: PlatformType
    kpi: KPIResultSchema

class AnalysisResultSchema(BaseModel):
    platformResults: List[PlatformKPIResultSchema]
    totalKPI: KPIResultSchema