#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
# BlackNode Sentinel — One Command to Run Everything
# ─────────────────────────────────────────────────────────
# Usage: bash run.sh
# ─────────────────────────────────────────────────────────

set -e

echo ""
echo "========================================"
echo "  BLACKNODE SENTINEL"
echo "  Security Operations Center"
echo "========================================"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not found. Install Docker first:"
    echo "  curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "[ERROR] Docker Compose not found."
    exit 1
fi

# Detect docker compose command
if docker compose version &> /dev/null 2>&1; then
    DC="docker compose"
else
    DC="docker-compose"
fi

# Stop any existing containers
echo "[1/4] Stopping existing containers..."
$DC down --remove-orphans 2>/dev/null || true

# Build and start
echo "[2/4] Building and starting containers..."
$DC up --build -d

# Wait for services
echo "[3/4] Waiting for services to start..."
for i in {1..30}; do
    if curl -s http://localhost:5004/health > /dev/null 2>&1; then
        break
    fi
    sleep 2
done

# Register user and seed data
echo "[4/4] Setting up demo data..."

# Register user
curl -s -X POST http://localhost:5004/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@blacknode.io","password":"BlackNode2025!"}' > /dev/null 2>&1 || true

# Seed demo data
cd demo-app 2>/dev/null && node server.js 2>&1 | head -20 && cd .. 2>/dev/null || true

echo ""
echo "========================================"
echo "  READY"
echo "========================================"
echo ""
echo "  Open:  http://localhost:3000"
echo "  Login: admin@blacknode.io"
echo "  Pass:  BlackNode2025!"
echo ""
echo "  Pages:"
echo "    Dashboard    — Threat overview"
echo "    Applications — 10 monitored companies"
echo "    Events       — 38 security events"
echo "    Threat Intel — 15 CVEs + 10 OTX feeds"
echo "    Network      — 10 infrastructure nodes"
echo "    Settings     — Security configuration"
echo ""
echo "========================================"
echo ""
