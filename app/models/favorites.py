import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class FavoriteImage(Base):
    __tablename__ = 'favorite_images'
    __table_args__ = (UniqueConstraint('nasa_date', name='uq_favorite_image_date'),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nasa_date: Mapped[date] = mapped_column(Date, nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    media_url: Mapped[str] = mapped_column(String(500), nullable=False)
    media_type: Mapped[str] = mapped_column(String(50), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class FavoriteAsteroid(Base):
    __tablename__ = "favorite_asteroids"
    __table_args__ = (UniqueConstraint("nasa_id", name="uq_favorite_asteroid_nasa_id"),)
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nasa_id: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    approach_date: Mapped[date] = mapped_column(Date, nullable=False)
    distance_km: Mapped[Decimal] = mapped_column(Numeric(20, 4), nullable=False)
    speed_kph: Mapped[Decimal] = mapped_column(Numeric(20, 4), nullable=False)
    estimated_diameter_km: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    hazardous: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())