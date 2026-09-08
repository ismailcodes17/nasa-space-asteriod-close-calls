# Space Close Calls

NASA dashboard for Astronomy Picture of the Day and near-Earth asteroids, with saved favorites.

## Live links

- App (Vercel): _add after deploy_
- API docs (Render): _add after deploy_

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, HTTPX
- Frontend: Next.js + TypeScript
- External API: [NASA Open APIs](https://api.nasa.gov/) (APOD + NeoWs)
- Deploy: Render (API + DB), Vercel (frontend)

## Architecture

```text
Browser → Next.js (Vercel) → FastAPI (Render) → PostgreSQL / NASA API
```

The NASA API key stays on the backend only. Never put it in `NEXT_PUBLIC_...` or commit `.env`.

## Local setup

### 1. Database

```bash
docker compose up -d db
```

### 2. Backend

```bash
cp .env.example .env
# put your real NASA_API_KEY in .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

API docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
bun install
bun run dev
```

App: http://localhost:3000

## Main features

- View Astronomy Picture of the Day
- Search APOD by date
- Browse near-Earth asteroids (sort by distance/speed/diameter)
- Moon-distance conversion
- Save/remove favorite images and asteroids

## Environment variables

### Backend (`.env` / Render)

- `APP_NAME`
- `ENVIRONMENT`
- `DATABASE_URL` (must start with `postgresql+psycopg://`)
- `FRONTEND_URL`
- `NASA_API_KEY`

### Frontend (`.env.local` / Vercel)

- `NEXT_PUBLIC_API_URL` (example: `https://your-api.onrender.com/api/v1`)
