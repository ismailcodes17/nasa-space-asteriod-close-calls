"use client";

import { useEffect, useState } from "react";
import {
  deleteFavoriteAsteroid,
  deleteFavoriteImage,
  listFavoriteAsteroids,
  listFavoriteImages,
  type FavoriteAsteroid,
  type FavoriteImage,
} from "@/lib/api";

export default function FavoritesPage() {
  const [images, setImages] = useState<FavoriteImage[]>([]);
  const [asteroids, setAsteroids] = useState<FavoriteAsteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [imgs, rocks] = await Promise.all([listFavoriteImages(), listFavoriteAsteroids()]);
      setImages(imgs);
      setAsteroids(rocks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load favorites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ width: "min(1000px, 100%)", margin: "0 auto", padding: "24px 16px 48px" }}>
      <h1>Favorites</h1>
      <p style={{ color: "#9aa8c7" }}>Saved APOD images and asteroids from your database.</p>

      {loading && <p>Loading favorites...</p>}
      {error && <p style={{ color: "#ff6b7a" }}>{error}</p>}

      <h2 style={{ marginTop: 28 }}>Images</h2>
      {!loading && images.length === 0 && <p style={{ color: "#9aa8c7" }}>No favorite images yet.</p>}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {images.map((img) => (
          <article
            key={img.id}
            style={{
              background: "#10182b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.media_url} alt={img.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
            <div style={{ padding: 12 }}>
              <div style={{ color: "#9aa8c7", fontSize: 13 }}>{img.nasa_date}</div>
              <strong>{img.title}</strong>
              <button
                onClick={async () => {
                  await deleteFavoriteImage(img.id);
                  await load();
                }}
                style={{
                  display: "block",
                  marginTop: 10,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: 0,
                  background: "#ff6b7a",
                  color: "#1a0508",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <h2 style={{ marginTop: 32 }}>Asteroids</h2>
      {!loading && asteroids.length === 0 && <p style={{ color: "#9aa8c7" }}>No favorite asteroids yet.</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {asteroids.map((a) => (
          <div
            key={a.id}
            style={{
              background: "#10182b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div>
              <strong>{a.name}</strong>
              <div style={{ color: "#9aa8c7", fontSize: 14 }}>
                {a.approach_date} · {Number(a.distance_km).toLocaleString()} km ·{" "}
                {a.hazardous ? "hazardous" : "not hazardous"}
              </div>
            </div>
            <button
              onClick={async () => {
                await deleteFavoriteAsteroid(a.id);
                await load();
              }}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: 0,
                background: "#ff6b7a",
                color: "#1a0508",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
