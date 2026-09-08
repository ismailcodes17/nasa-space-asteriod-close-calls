import uuid
from datetime import date,datetime
from decimal import Decimal
from pydantic import BaseModel,Field
class ApodRead(BaseModel):
    date: date
    title: str
    explanation: str
    media_url: str
    media_type: str

class AsteroidRead(BaseModel):
    nasa_id: str
    name: str
    approach_date: date
    distance_km: float
    moon_distances: float
    speed_kph: float
    estimated_diameter_km: float
    hazardous: bool


class FavoriteImageCreate(BaseModel):
    nasa_date: date
    title: str = Field(min_length=1)
    media_url: str
    media_type: str
    explanation: str


class FavoriteImageRead(BaseModel):
    id: uuid.UUID
    nasa_date: date
    title: str
    media_url: str
    media_type: str
    explanation: str
    created_at: datetime
    model_config = {"from_attributes": True}


class FavoriteAsteroidCreate(BaseModel):
    nasa_id: str
    name: str
    approach_date: date
    distance_km: Decimal
    speed_kph: Decimal
    estimated_diameter_km: Decimal
    hazardous: bool = False


class FavoriteAsteroidRead(BaseModel):
    id: uuid.UUID
    nasa_id: str
    name: str
    approach_date: date
    distance_km: Decimal
    speed_kph: Decimal
    estimated_diameter_km: Decimal
    hazardous: bool
    created_at: datetime
    model_config = {"from_attributes": True}

