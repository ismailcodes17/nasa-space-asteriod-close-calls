const NASA = "https://api.nasa.gov";
const KEY = process.env.NASA_API_KEY || "DEMO_KEY";
const MOON_KM = 384400;

export async function loadApod(day?: string) {
  const params = new URLSearchParams({ api_key: KEY });
  if (day) params.set("date", day);
  const response = await fetch(`${NASA}/planetary/apod?${params}`, { cache: "no-store" });
  if (response.status === 404) throw new Error("APOD not found for that date");
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`NASA APOD error: ${response.status} ${detail.slice(0, 180)}`);
  }
  const data = await response.json();
  const mediaUrl = data.hdurl || data.url || "";
  if (!mediaUrl) throw new Error("NASA APOD response missing media url");
  return {
    date: data.date,
    title: data.title || "Untitled",
    explanation: data.explanation || "",
    media_url: mediaUrl,
    media_type: data.media_type || "image",
  };
}

export async function loadAsteroids(sort = "distance") {
  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  const params = new URLSearchParams({
    api_key: KEY,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  });
  const response = await fetch(`${NASA}/neo/rest/v1/feed?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`NASA asteroid error: ${response.status}`);
  const payload = await response.json();
  const asteroids = [];
  for (const items of Object.values(payload.near_earth_objects || {}) as Array<Record<string, unknown>[]>) {
    for (const item of items) {
      const approaches = (item.close_approach_data as Record<string, unknown>[]) || [];
      if (!approaches.length) continue;
      const approach = approaches[0];
      const diameter = (item.estimated_diameter as { kilometers: { estimated_diameter_min: number; estimated_diameter_max: number } }).kilometers;
      const distanceKm = Number((approach.miss_distance as { kilometers: string }).kilometers);
      asteroids.push({
        nasa_id: String(item.id),
        name: String(item.name),
        approach_date: String(approach.close_approach_date),
        distance_km: distanceKm,
        moon_distances: Math.round((distanceKm / MOON_KM) * 1000) / 1000,
        speed_kph: Number((approach.relative_velocity as { kilometers_per_hour: string }).kilometers_per_hour),
        estimated_diameter_km: (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2,
        hazardous: Boolean(item.is_potentially_hazardous_asteroid),
      });
    }
  }
  const keys: Record<string, (row: { distance_km: number; speed_kph: number; estimated_diameter_km: number }) => number> = {
    distance: (row) => row.distance_km,
    speed: (row) => row.speed_kph,
    diameter: (row) => row.estimated_diameter_km,
  };
  asteroids.sort((a, b) => (keys[sort] || keys.distance)(a) - (keys[sort] || keys.distance)(b));
  return asteroids;
}
