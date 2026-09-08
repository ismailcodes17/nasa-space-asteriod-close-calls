"use client";

import { useEffect, useState } from "react";
import {
  createFavoriteAsteroid,
  fetchAsteroids,
  type Asteroid,
} from "@/lib/api";

type SortKey = "distance" | "speed" | "diameter";

export default function AsteroidsPage() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [sort, setSort] = useState<SortKey>("distance");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setAsteroids(await fetchAsteroids(sort));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load asteroids");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sort]);

  async function saveAsteroid(a: Asteroid) {
    setMessage("");
    setError("");
    try {
      await createFavoriteAsteroid({
        nasa_id: a.nasa_id,
        name: a.name,
        approach_date: a.approach_date,
        distance_km: a.distance_km,
        speed_kph: a.speed_kph,
        estimated_diameter_km: a.estimated_diameter_km,
        hazardous: a.hazardous,
      });
      setMessage(`Saved ${a.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save asteroid");
    }
  }

  return (
    <main style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: "24px 16px 48px" }}>
      <h1 style={{ marginBottom: 8 }}>Near-Earth Asteroids</h1>
      <p style={{ color: "#9aa8c7", marginTop: 0 }}>
        Next 7 days. Distances also shown in Moon-distances.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["distance", "speed", "diameter"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: sort === key ? "#6ea8ff" : "transparent",
              color: sort === key ? "#071018" : "white",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            Sort: {key}
          </button>
        ))}
      </div>

      {loading && <p>Loading asteroids...</p>}
      {error && <p style={{ color: "#ff6b7a" }}>{error}</p>}
      {message && <p style={{ color: "#5ddea5" }}>{message}</p>}

      {!loading && asteroids.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9aa8c7" }}>
                <th style={{ padding: 10 }}>Name</th>
                <th style={{ padding: 10 }}>Date</th>
                <th style={{ padding: 10 }}>Distance (LD)</th>
                <th style={{ padding: 10 }}>Speed (kph)</th>
                <th style={{ padding: 10 }}>Diameter (km)</th>
                <th style={{ padding: 10 }}>Hazard</th>
                <th style={{ padding: 10 }}></th>
              </tr>
            </thead>
            <tbody>
              {asteroids.slice(0, 40).map((a) => (
                <tr key={`${a.nasa_id}-${a.approach_date}`} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 10 }}>{a.name}</td>
                  <td style={{ padding: 10 }}>{a.approach_date}</td>
                  <td style={{ padding: 10 }}>{a.moon_distances}</td>
                  <td style={{ padding: 10 }}>{Math.round(a.speed_kph).toLocaleString()}</td>
                  <td style={{ padding: 10 }}>{a.estimated_diameter_km.toFixed(3)}</td>
                  <td style={{ padding: 10, color: a.hazardous ? "#ff6b7a" : "#5ddea5" }}>
                    {a.hazardous ? "Yes" : "No"}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      onClick={() => saveAsteroid(a)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: 0,
                        background: "#5ddea5",
                        color: "#071018",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
