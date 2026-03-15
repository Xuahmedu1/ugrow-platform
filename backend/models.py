"""
UGROW Database Models
SQLAlchemy ORM models for PostgreSQL database
Implements SRS Section 3 Database Design
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
    ARRAY,
    Numeric,
    Date,
    Boolean,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.sql import func

# ============================================
# Base Configuration
# ============================================

Base = declarative_base()


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

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CLIENT)
    
    # Foreign key to restaurant (NULL for admin users)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id"), nullable=True)
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
    Platform array stored as PostgreSQL array of enum strings
    """
    __tablename__ = "restaurants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
    
    # Platforms as PostgreSQL array
    platforms = Column(ARRAY(String), nullable=False, default=list)
    
    # Status
    status = Column(Enum(RestaurantStatus), nullable=False, default=RestaurantStatus.ACTIVE)

    # Relationships
    users = relationship("User", back_populates="restaurant", foreign_keys="User.restaurant_id")
    credentials = relationship("PlatformCredential", back_populates="restaurant", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="restaurant", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Restaurant(id={self.id}, name={self.name}, status={self.status})>"

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

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Enum(PlatformType), nullable=False)
    credential_type = Column(Enum(CredentialType), nullable=False, default=CredentialType.PORTAL)
    login_email = Column(Text, nullable=False)
    password_encrypted = Column(Text, nullable=False)  # AES-256 encrypted per SRS

    # Relationships
    restaurant = relationship("Restaurant", back_populates="credentials")

    def __repr__(self):
        return f"<PlatformCredential(id={self.id}, platform={self.platform}, restaurant={self.restaurant_id})>"

    __table_args__ = (
        # Unique constraint: one portal credential per platform per restaurant
        # Tablet credentials are additional for Deliveroo only
        {"sqlite_autoincrement": True},
    )


# ============================================
# Report Model (SRS 3.1.4)
# ============================================

class Report(Base):
    """
    Reports table - stores analysis results as JSONB
    Master sheet path references exported Excel file
    """
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(UUID(as_uuid=True), ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Date range
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    
    # Platforms included in this report
    platforms_included = Column(ARRAY(String), nullable=False)
    
    # Full KPI results stored as JSONB for flexibility
    kpi_data_json = Column(JSONB, nullable=False)
    
    # Path to generated Excel file
    master_sheet_path = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reports")
    created_by_user = relationship("User", back_populates="created_reports")

    def __repr__(self):
        return f"<Report(id={self.id}, restaurant={self.restaurant_id}, date_from={self.date_from})>"

    @property
    def label(self) -> str:
        """Generate report label: 'Report: [From Date] to [To Date]'"""
        return f"Report: {self.date_from.strftime('%d/%m/%Y')} to {self.date_to.strftime('%d/%m/%Y')}"


# ============================================
# Database Engine and Session
# ============================================

def get_engine(database_url: str):
    """Create database engine with proper settings"""
    return create_engine(
        database_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,   # Recycle connections after 1 hour
        echo=False,          # Set to True for SQL debugging
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