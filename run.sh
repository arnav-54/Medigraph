#!/bin/bash
# ==============================================================================
# MediGraph AI — Unified Development Runner
# Starts MongoDB (port 27017), Python OCR (port 8000), Node Backend (port 4000), and Vite (port 5173)
# ==============================================================================

set -e

cd "$(dirname "$0")"

echo "============================================================"
echo "  Starting MediGraph AI Platform (MongoDB Engine)"
echo "============================================================"

# Cleanup function on Ctrl+C
cleanup() {
  echo ""
  echo "Shutting down all MediGraph AI services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 0. Start MongoDB if installed and not already running
if command -v mongod >/dev/null 2>&1; then
  if ! nc -z 127.0.0.1 27017 >/dev/null 2>&1; then
    echo "▶ [0/3] Starting Local MongoDB Database (Port 27017)..."
    mkdir -p storage/mongodb-data
    mongod --dbpath storage/mongodb-data --port 27017 --bind_ip 127.0.0.1 > storage/mongodb-data/mongod.log 2>&1 &
    sleep 1
  else
    echo "✔ MongoDB is running on port 27017"
  fi
fi

# 1. Start Python Document OCR Service
echo "▶ [1/3] Starting Document OCR Service (Port 8000)..."
if [ -f "document-service/.venv/bin/uvicorn" ]; then
  PYTHONPATH=document-service document-service/.venv/bin/uvicorn api.main:app --host 0.0.0.0 --port 8000 &
else
  echo "⚠️ Warning: document-service/.venv not found. Running with system python3..."
  python3 -m uvicorn api.main:app --app-dir document-service --host 0.0.0.0 --port 8000 &
fi

# 2. Start Node.js Backend API
echo "▶ [2/3] Starting Core Backend API with MongoDB (Port 4000)..."
node backend/src/server.js &

# Wait 2 seconds for backend to initialize
sleep 2

# 3. Start Vite Frontend
echo "▶ [3/3] Starting Vite Frontend UI (Port 5173)..."
npm run dev:frontend &

echo ""
echo "============================================================"
echo "  All Services are Running with MongoDB!"
echo "  ➜ Frontend UI : http://localhost:5173"
echo "  ➜ Backend API : http://localhost:4000"
echo "  ➜ MongoDB DB  : mongodb://127.0.0.1:27017/medigraph_db"
echo "  ➜ OCR Service : http://localhost:8000"
echo "  Press Ctrl+C to stop all services"
echo "============================================================"
echo ""

# Keep alive
wait
