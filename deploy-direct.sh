#!/bin/bash

# =====================================
# NEON MURER CMS - DIREKTES DEPLOYMENT
# =====================================
# Klont direkt von GitHub - KEINE Actions nötig!

set -e

echo "🚀 DIREKTES GitHub Deployment - Port 3835"
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check port
if command -v lsof &> /dev/null; then
    if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port 3835 already in use"
        exit 1
    fi
fi

log "📥 Downloading docker-compose.direct.yml..."
curl -o docker-compose.yml "https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.direct.yml"

log "🛑 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

log "🏗️  Building and starting services..."
info "This will clone from GitHub and build locally"
docker compose up -d --build

log "⏳ Waiting for services..."

# Wait for database
info "Waiting for database..."
for i in {1..60}; do
    if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
        log "✅ Database ready"
        break
    fi
    [ $i -eq 60 ] && { echo "❌ Database timeout"; exit 1; }
    sleep 1
done

# Wait for Redis
info "Waiting for Redis..."
for i in {1..30}; do
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log "✅ Redis ready"
        break
    fi
    [ $i -eq 30 ] && { echo "❌ Redis timeout"; exit 1; }
    sleep 1
done

# Wait for app
info "Waiting for application..."
for i in {1..120}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Application ready"
        break
    fi
    [ $i -eq 120 ] && { echo "❌ Application timeout"; exit 1; }
    sleep 1
done

log "🎉 Deployment completed!"

echo ""
echo "=============================================="
echo "🌐 NEON MURER CMS - READY!"
echo "=============================================="
echo "📍 Website: http://localhost:3835/"
echo "🎛️  Admin: http://localhost:3835/cms-admin/"
echo "📊 Health: http://localhost:3835/api/health"
echo ""
echo "🔐 Login:"
echo "   Email: admin@neonmurer.ch"
echo "   Password: admin123"
echo ""
echo "🐳 Services:"
docker compose ps
echo "=============================================="
