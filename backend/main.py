from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_database, engine
from models import Base
from routers import auth, restaurants, analysis, reports, export

# إنشاء الجداول عند التشغيل
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting UGROW API...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    init_database()  # Seed admin user
    yield
    # Shutdown
    print("👋 Shutting down...")

app = FastAPI(
    title="UGROW API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - السماح للـ Frontend بالاتصال
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["restaurants"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(export.router, prefix="/api/export", tags=["export"])

@app.get("/")
def root():
    return {
        "status": "UGROW API running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}