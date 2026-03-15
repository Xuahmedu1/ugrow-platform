"""
UGROW Backend API
FastAPI application with PostgreSQL, JWT auth, and Excel processing
SRS Section 2 - System Architecture
"""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer

# Database
from database import init_database, check_database_connection, seed_admin_user, get_db
from sqlalchemy.orm import Session

# Models (for startup validation)
import models

# Routers
from routers import auth, reports, restaurants, analysis, export

# ============================================
# Configuration
# ============================================

APP_VERSION = "1.0.0"
APP_NAME = "UGROW API"

# CORS settings
CORS_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"


# ============================================
# Lifespan (Startup/Shutdown Events)
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler
    Runs on startup and shutdown
    """
    # Startup
    print(f"Starting {APP_NAME} v{APP_VERSION}...")
    
    # Initialize database
    try:
        init_database()
        seed_admin_user()
        print("✓ Database initialized")
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        # Don't raise - allow app to start for health checks
    
    # Verify database connection
    if check_database_connection():
        print("✓ Database connection verified")
    else:
        print("✗ Database connection failed")
    
    print(f"✓ {APP_NAME} ready")
    
    yield
    
    # Shutdown
    print(f"Shutting down {APP_NAME}...")


# ============================================
# FastAPI App Initialization
# ============================================

app = FastAPI(
    title=APP_NAME,
    description="Marketing & Data Analysis Platform API for Restaurant Analytics",
    version=APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
)

# Security scheme for Swagger UI
security = HTTPBearer()

# ============================================
# Middleware
# ============================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS],
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"]
)

# ============================================
# Router Registration
# ============================================

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(restaurants.router)
app.include_router(analysis.router)
app.include_router(export.router)

# ============================================
# Health Check Endpoints
# ============================================

@app.get("/", tags=["health"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": APP_NAME,
        "version": APP_VERSION,
        "status": "operational",
        "documentation": "/docs" if os.getenv("ENVIRONMENT") != "production" else None
    }


@app.get("/health", tags=["health"])
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check
    Verifies database connectivity and critical services
    """
    health_status = {
        "status": "healthy",
        "timestamp": str(datetime.now()),
        "services": {}
    }
    
    # Database check
    try:
        db.execute("SELECT 1")
        health_status["services"]["database"] = "connected"
    except Exception as e:
        health_status["services"]["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    # File storage check
    try:
        upload_dir = os.getenv("LOCAL_STORAGE_PATH", "./storage/uploads")
        os.makedirs(upload_dir, exist_ok=True)
        health_status["services"]["storage"] = "accessible"
    except Exception as e:
        health_status["services"]["storage"] = f"error: {str(e)}"
        health_status["status"] = "degraded"
    
    status_code = 200 if health_status["status"] == "healthy" else 503
    
    return JSONResponse(
        content=health_status,
        status_code=status_code
    )


@app.get("/ready", tags=["health"])
async def readiness_check():
    """
    Kubernetes-style readiness probe
    """
    return {"ready": True}


@app.get("/live", tags=["health"])
async def liveness_check():
    """
    Kubernetes-style liveness probe
    """
    return {"alive": True}


# ============================================
# Error Handlers
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "message": exc.detail,
            "error": "HTTP Error"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Catch-all exception handler"""
    # Log the error in production
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "statusCode": 500,
            "message": "Internal server error",
            "error": "Internal Server Error"
        }
    )


# ============================================
# Startup Validation
# ============================================

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT") == "development"
    workers = int(os.getenv("WORKERS", "1")) if not reload else 1
    
    # Validate critical environment variables in production
    if os.getenv("ENVIRONMENT") == "production":
        required_vars = ["JWT_SECRET_KEY", "DATABASE_URL"]
        missing = [v for v in required_vars if not os.getenv(v)]
        if missing:
            print(f"ERROR: Missing required environment variables: {missing}")
            exit(1)
    
    # Start server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload,
        workers=workers,
        log_level="info"
    )