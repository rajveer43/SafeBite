from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.database.database import engine
from app.database.base import Base
from app.api.restaurant import router as restaurant_router
from app.api.inspection import router as inspection_router
from app.api.complaint import router as complaint_router
from app.api.certificate import router as certificate_router
from app.api.safety_score import router as safety_score_router
from app.api.admin import router as admin_router
from app.api.notification import router as notification_router

import app.models

# Base.metadata.create_all(bind=engine)


import os
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads/certificates", exist_ok=True)

app = FastAPI(
    title="SafeBite API",
    version="1.0.0",
    description="Hyperlocal Food Safety & Kitchen Transparency Platform",
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(inspection_router)
app.include_router(complaint_router)
app.include_router(certificate_router)
app.include_router(safety_score_router)
app.include_router(admin_router)
app.include_router(notification_router)


@app.get("/")
def home():
    return {"message": "SafeBite API Running 🚀"}


from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "Healthy", "database": "Connected"}
    except Exception as e:
        return {
            "status": "Unhealthy",
            "database": "Disconnected",
            "error": str(e),
        }
