"""
UGROW Database Configuration
Database connection, session management, and utilities
"""

import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from models import Base, get_engine, get_session_maker, init_db

# ============================================
# Configuration
# ============================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://ugrow:ugrow_password@localhost:5432/ugrow_db"
)

# ============================================
# Engine and Session Factory
# ============================================

engine = get_engine(DATABASE_URL)
SessionLocal = get_session_maker(engine)


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

def init_database():
    """Initialize database tables"""
    init_db(engine)
    print("Database initialized successfully")


def create_tables():
    """Create all tables (idempotent)"""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all tables (use with caution)"""
    Base.metadata.drop_all(bind=engine)


# ============================================
# Connection Event Listeners
# ============================================

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """
    Set database-specific pragmas on connection.
    For PostgreSQL, we could set session-level configurations here.
    """
    # PostgreSQL specific settings could be applied here
    pass


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
        print(f"Database connection failed: {e}")
        return False


# ============================================
# Seeding
# ============================================

def seed_admin_user():
    """Seed the immutable admin user per SRS 4.1"""
    from models import User, UserRole, UserStatus
    from services.auth_service import AuthService
    
    with get_db_session() as session:
        # Check if admin exists
        admin = session.query(User).filter(User.email == "admin@ugrow.com").first()
        if not admin:
            admin_password = os.getenv("ADMIN_PASSWORD", "ugrow1@@")
            
            auth_service = AuthService(session)
            password_hash = auth_service.hash_password(admin_password)
            
            admin = User(
                id=uuid.uuid4(),
                username="admin",
                email="admin@ugrow.com",
                password_hash=password_hash,
                role=UserRole.ADMIN,
                restaurant_id=None,
                status=UserStatus.ACTIVE
            )
            session.add(admin)
            session.commit()
            print("Admin user created: admin@ugrow.com")
        else:
            print("Admin user already exists")


# ============================================
# Utilities
# ============================================

def reset_database():
    """
    DANGER: Drop and recreate all tables.
    Only use in development or testing.
    """
    drop_tables()
    create_tables()
    seed_admin_user()
    print("Database reset complete")


if __name__ == "__main__":
    # Run initialization when script is executed directly
    init_database()
    seed_admin_user()