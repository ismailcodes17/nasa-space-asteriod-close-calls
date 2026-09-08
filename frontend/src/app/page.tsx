"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createFavoriteImage,
  fetchApod,
  type Apod,
} from "@/lib/api";

export default function HomePage() {
  const [apod, setApod] = useState<Apod | null>(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load(day?: string) {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const data = await fetchApod(day || undefined);
      setApod(data);
    } catch (e) {
      setApod(null);
      const raw = e instanceof Error ? e.message : "Could not load APOD";
      setError(
        raw.includes("Failed to fetch")
          ? "Cannot reach API. Is FastAPI running on port 8000?"
          : raw.slice(0, 300),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    load(date);
  }

  async function saveFavorite() {
    if (!apod) return;
    setMessage("");
    setError("");
    try {
      await createFavoriteImage({
        nasa_date: apod.date,
        title: apod.title,
        media_url: apod.media_url,
        media_type: apod.media_type,
        explanation: apod.explanation,
      });
      setMessage("Saved to favorites");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save favorite");
    }
  }

  return (
    <main style={{ width: "min(900px, 100%)", margin: "0 auto", padding: "24px 16px 48px" }}>
      <h1 style={{ marginBottom: 8 }}>Astronomy Picture of the Day</h1>
      <p style={{ color: "#9aa8c7", marginTop: 0 }}>
        Powered by your FastAPI backend + NASA APOD.
      </p>

      <form
        onSubmit={onSearch}
        style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "20px 0 24px" }}
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "#10182b",
            color: "white",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: 0,
            background: "#6ea8ff",
            color: "#071018",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Search date
        </button>
        <button
          type="button"
          onClick={() => load()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Today
        </button>
      </form>

      {loading && <p>Loading space photo...</p>}
      {error && <p style={{ color: "#ff6b7a" }}>{error}</p>}
      {message && <p style={{ color: "#5ddea5" }}>{message}</p>}

      {apod && !loading && (
        <section
          style={{
            background: "#10182b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {apod.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={apod.media_url}
              alt={apod.title}
              style={{ width: "100%", maxHeight: 480, objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ padding: 16 }}>
              <a href={apod.media_url} target="_blank" rel="noreferrer" style={{ color: "#6ea8ff" }}>
                Open media
              </a>
            </div>
          )}

          <div style={{ padding: 20 }}>
            <div style={{ color: "#9aa8c7", marginBottom: 6 }}>{apod.date}</div>
            <h2 style={{ marginTop: 0 }}>{apod.title}</h2>
            <p style={{ lineHeight: 1.6, color: "#c9d4ef" }}>{apod.explanation}</p>
            <button
              onClick={saveFavorite}
              style={{
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 10,
                border: 0,
                background: "#5ddea5",
                color: "#071018",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save favorite
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
