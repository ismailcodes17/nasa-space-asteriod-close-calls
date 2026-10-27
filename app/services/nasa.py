from datetime import date, timedelta

import httpx

from app.core.config import settings

MOON_KM = 384_400
NASA_BASE = "https://api.nasa.gov"
APOD_V2 = "https://science.nasa.gov/wp-json/wp/v2/apod-basic"


def _client() -> httpx.Client:
    # Ignore broken HTTP_PROXY env vars from tools/IDEs
    return httpx.Client(timeout=30.0, trust_env=False)


def _plain(value: str) -> str:
    import re

    return " ".join(re.sub(r"<[^>]+>", " ", value or "").split())


def get_apod(day: date | None = None) -> dict:
    if day:
        url = f"{APOD_V2}/{day.strftime('%y%m%d')}"
    else:
        url = APOD_V2

    with _client() as client:
        response = client.get(url, params=None if day else {"per_page": 1})

    if response.status_code == 404:
        raise ValueError("APOD not found for that date")
    if response.status_code != 200:
        raise RuntimeError(f"NASA APOD error: {response.status_code} {response.text[:200]}")

    payload = response.json()
    data = payload[0] if isinstance(payload, list) else payload
    if not isinstance(data, dict) or data.get("code"):
        raise ValueError("APOD not found for that date")

    media_url = data.get("hdurl") or ""
    if not media_url:
        raise RuntimeError("NASA APOD response missing media url")

    return {
        "date": data["date"],
        "title": data.get("title") or "Untitled",
        "explanation": _plain(data.get("explanation") or ""),
        "media_url": media_url,
        "media_type": data.get("media_type") or "image",
    }


def get_asteroids(start: date | None = None, end: date | None = None, sort: str = "distance") -> list[dict]:
    start_date = start or date.today()
    end_date = end or (start_date + timedelta(days=7))

    params = {
        "api_key": settings.NASA_API_KEY,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
    }

    with _client() as client:
        response = client.get(f"{NASA_BASE}/neo/rest/v1/feed", params=params)

    if response.status_code == 429:
        raise RuntimeError("NASA rate limit hit. Try again later.")
    if response.status_code != 200:
        raise RuntimeError(f"NASA asteroid error: {response.status_code}")

    payload = response.json()
    asteroids: list[dict] = []

    for day, items in payload.get("near_earth_objects", {}).items():
        for item in items:
            approaches = item.get("close_approach_data") or []
            if not approaches:
                continue
            approach = approaches[0]
            diameter = item["estimated_diameter"]["kilometers"]
            distance_km = float(approach["miss_distance"]["kilometers"])

            asteroids.append(
                {
                    "nasa_id": item["id"],
                    "name": item["name"],
                    "approach_date": approach["close_approach_date"],
                    "distance_km": distance_km,
                    "moon_distances": round(distance_km / MOON_KM, 3),
                    "speed_kph": float(approach["relative_velocity"]["kilometers_per_hour"]),
                    "estimated_diameter_km": (
                        float(diameter["estimated_diameter_min"])
                        + float(diameter["estimated_diameter_max"])
                    )
                    / 2,
                    "hazardous": item.get("is_potentially_hazardous_asteroid", False),
                }
            )

    key_map = {
        "distance": lambda a: a["distance_km"],
        "speed": lambda a: a["speed_kph"],
        "diameter": lambda a: a["estimated_diameter_km"],
    }
    sort_key = key_map.get(sort, key_map["distance"])
    asteroids.sort(key=sort_key)
    return asteroids
