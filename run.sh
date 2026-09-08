#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

# Start Postgres if Docker is available
if docker info >/dev/null 2>&1; then
  docker compose up -d db
  echo "Waiting for database..."
  sleep 3
  alembic upgrade head || true
else
  echo "WARNING: Docker is not running. Start Docker Desktop, then rerun ./run.sh"
fi

# Free port 8000 if something is stuck
if lsof -ti :8000 >/dev/null 2>&1; then
  lsof -ti :8000 | xargs kill -9 || true
fi

echo "Starting Space Close Calls API..."
echo "Docs: http://127.0.0.1:8000/docs"
exec uvicorn main:app --reload --host 127.0.0.1 --port 8000
