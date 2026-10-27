const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export type Apod = {
  date: string;
  title: string;
  explanation: string;
  media_url: string;
  media_type: string;
};

export type Asteroid = {
  nasa_id: string;
  name: string;
  approach_date: string;
  distance_km: number;
  moon_distances: number;
  speed_kph: number;
  estimated_diameter_km: number;
  hazardous: boolean;
};

export type FavoriteImage = {
  id: string;
  nasa_date: string;
  title: string;
  media_url: string;
  media_type: string;
  explanation: string;
  created_at: string;
};

export type FavoriteAsteroid = {
  id: string;
  nasa_id: string;
  name: string;
  approach_date: string;
  distance_km: number;
  speed_kph: number;
  estimated_diameter_km: number;
  hazardous: boolean;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit, base = API_URL): Promise<T> {
  const method = (options?.method || "GET").toUpperCase();
  const headers = new Headers(options?.headers || {});

  if (method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text || "Request failed";
    try {
      const parsed = JSON.parse(text);
      if (parsed?.detail) {
        message = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {
      // keep raw text
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function fetchApod(day?: string) {
  return request<Apod>(day ? `/apod/${day}` : "/apod", undefined, "/api/v1");
}

export function fetchAsteroids(sort: "distance" | "speed" | "diameter" = "distance") {
  return request<Asteroid[]>(`/asteroids?sort=${sort}`, undefined, "/api/v1");
}

export function listFavoriteImages() {
  return request<FavoriteImage[]>("/favorites/images");
}

export function createFavoriteImage(payload: Omit<FavoriteImage, "id" | "created_at">) {
  return request<FavoriteImage>("/favorites/images", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteFavoriteImage(id: string) {
  return request<void>(`/favorites/images/${id}`, { method: "DELETE" });
}

export function listFavoriteAsteroids() {
  return request<FavoriteAsteroid[]>("/favorites/asteroids");
}

export function createFavoriteAsteroid(payload: {
  nasa_id: string;
  name: string;
  approach_date: string;
  distance_km: number;
  speed_kph: number;
  estimated_diameter_km: number;
  hazardous: boolean;
}) {
  return request<FavoriteAsteroid>("/favorites/asteroids", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteFavoriteAsteroid(id: string) {
  return request<void>(`/favorites/asteroids/${id}`, { method: "DELETE" });
}
