from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from routers import auth, export, reports

app = FastAPI(title="UGROW API", version="1.0.0")

# CORS - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,   prefix="/api/auth",   tags=["auth"])
app.include_router(export.router, prefix="/api/export", tags=["export"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])





@app.get("/")
def root():
    return {"status": "UGROW API running"}