"""
UGROW Database Configuration
SQLite for local development - fast and simple
"""

import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event, String
from sqlalchemy.orm import Session, sessionmaker, declarative_base

# ============================================
# Configuration - SQLite للتشغيل السريع
# ============================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./ugrow.db"  # ملف محلي بجانب المشروع
)

# ============================================
# Engine and Session Factory
# ============================================

def get_engine(database_url: str):
    """Create database engine with proper settings"""
    # SQLite-specific settings
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    
    return create_engine(
        database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False,  # Set to True for SQL debugging
    )

engine = get_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============================================
# Session Management
# ============================================

@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Automatically commits on success, rolls back on exception.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.
    Use in route handlers: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================
# Database Initialization
# ============================================

# Base سيتم استيراده من models بعد تعديلها
Base = None

def init_db(engine):
    """Initialize database - create all tables"""
    from models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)

def init_database():
    """Initialize database tables and seed data"""
    from models import Base as ModelsBase, User, UserRole, UserStatus
    import uuid
    from datetime import datetime
    
    # Create tables
    ModelsBase.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    # Seed admin user
    with get_db_session() as session:
        from services.auth_service import AuthService
        
        # Check if admin exists
        admin = session.query(User).filter(User.email == "admin@ugrow.com").first()
        if not admin:
            admin_password = os.getenv("ADMIN_PASSWORD", "ugrow1@@")
            
            auth_service = AuthService(session)
            password_hash = auth_service.hash_password(admin_password)
            
            # Use string ID for SQLite compatibility
            admin = User(
                id=str(uuid.uuid4()),
                username="admin",
                email="admin@ugrow.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                restaurant_id=None,
                status=UserStatus.ACTIVE
            )
            session.add(admin)
            session.commit()
            print("✅ Admin user created: admin@ugrow.com / ugrow1@@")
        else:
            print("ℹ️ Admin user already exists")

# ============================================
# Health Check
# ============================================

def check_database_connection() -> bool:
    """Verify database connectivity"""
    try:
        with get_db_session() as session:
            session.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False