from datetime import date
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import engine, get_db
from app.models.favorites import FavoriteAsteroid, FavoriteImage
from app.schemas.nasa import (
    ApodRead,
    AsteroidRead,
    FavoriteAsteroidCreate,
    FavoriteAsteroidRead,
    FavoriteImageCreate,
    FavoriteImageRead,
)
from app.services.nasa import get_apod, get_asteroids

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Space Close Calls API"}


@app.get("/api/v1/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "error",
        "app": settings.APP_NAME,
        "database": db_status,
    }


@app.get("/api/v1/apod", response_model=ApodRead)
def read_apod():
    try:
        return get_apod()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"NASA APOD request failed: {type(e).__name__}: {e}",
        ) from e


@app.get("/api/v1/apod/{day}", response_model=ApodRead)
def read_apod_by_date(day: date):
    try:
        return get_apod(day)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"NASA APOD request failed: {type(e).__name__}: {e}",
        ) from e


@app.get("/api/v1/asteroids", response_model=list[AsteroidRead])
def read_asteroids(
    start_date: date | None = None,
    end_date: date | None = None,
    sort: str = Query(default="distance", pattern="^(distance|speed|diameter)$"),
):
    try:
        return get_asteroids(start_date, end_date, sort)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"NASA asteroid request failed: {type(e).__name__}: {e}",
        ) from e


@app.get("/api/v1/favorites/images", response_model=list[FavoriteImageRead])
def list_favorite_images(db: Session = Depends(get_db)):
    return db.query(FavoriteImage).order_by(FavoriteImage.created_at.desc()).all()


@app.post("/api/v1/favorites/images", response_model=FavoriteImageRead, status_code=201)
def create_favorite_image(payload: FavoriteImageCreate, db: Session = Depends(get_db)):
    existing = db.query(FavoriteImage).filter(FavoriteImage.nasa_date == payload.nasa_date).first()
    if existing:
        raise HTTPException(status_code=409, detail="Image already favorited")

    row = FavoriteImage(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/v1/favorites/images/{image_id}", status_code=204)
def delete_favorite_image(image_id: UUID, db: Session = Depends(get_db)):
    row = db.query(FavoriteImage).filter(FavoriteImage.id == image_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Favorite image not found")
    db.delete(row)
    db.commit()
    return None


@app.get("/api/v1/favorites/asteroids", response_model=list[FavoriteAsteroidRead])
def list_favorite_asteroids(db: Session = Depends(get_db)):
    return db.query(FavoriteAsteroid).order_by(FavoriteAsteroid.created_at.desc()).all()


@app.post("/api/v1/favorites/asteroids", response_model=FavoriteAsteroidRead, status_code=201)
def create_favorite_asteroid(payload: FavoriteAsteroidCreate, db: Session = Depends(get_db)):
    existing = db.query(FavoriteAsteroid).filter(FavoriteAsteroid.nasa_id == payload.nasa_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Asteroid already favorited")

    row = FavoriteAsteroid(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/v1/favorites/asteroids/{asteroid_id}", status_code=204)
def delete_favorite_asteroid(asteroid_id: UUID, db: Session = Depends(get_db)):
    row = db.query(FavoriteAsteroid).filter(FavoriteAsteroid.id == asteroid_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Favorite asteroid not found")
    db.delete(row)
    db.commit()
    return None
