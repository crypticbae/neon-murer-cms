#!/bin/bash

# =====================================
# NEON MURER CMS - EINFACHSTES DEPLOYMENT
# =====================================
# Nutzt git clone in Container - KEIN BUILD!

set -e

echo "🚀 EINFACHSTES Deployment - Port 3835"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker not found. Please install Docker first."
fi

# Check port
if command -v lsof &> /dev/null; then
    if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null 2>&1; then
        error "Port 3835 already in use"
    fi
fi

log "📥 Downloading docker-compose.simple.yml..."
curl -o docker-compose.yml "https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.simple.yml"

if [ ! -f docker-compose.yml ]; then
    error "Failed to download docker-compose.yml"
fi

log "🛑 Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

log "🚀 Starting services (no build needed)..."
info "This uses git clone inside containers - much faster!"
docker compose up -d

log "⏳ Waiting for services to start..."

# Wait for database
info "Waiting for database..."
for i in {1..60}; do
    if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
        log "✅ Database ready"
        break
    fi
    [ $i -eq 60 ] && { error "Database failed to start"; }
    sleep 1
done

# Wait for Redis
info "Waiting for Redis..."
for i in {1..30}; do
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log "✅ Redis ready"
        break
    fi
    [ $i -eq 30 ] && { error "Redis failed to start"; }
    sleep 1
done

# Wait for init to complete
info "Waiting for database initialization..."
for i in {1..180}; do
    if ! docker compose ps db-init | grep -q "Up"; then
        log "✅ Database initialization completed"
        break
    fi
    [ $i -eq 180 ] && { error "Database initialization timeout"; }
    sleep 1
done

# Wait for app
info "Waiting for application..."
for i in {1..180}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Application ready"
        break
    fi
    [ $i -eq 180 ] && { error "Application failed to start"; }
    sleep 2
done

log "🎉 Deployment completed successfully!"

echo ""
echo "=============================================="
echo "🌐 NEON MURER CMS - EINFACH & FERTIG!"
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
echo ""
echo "🔧 Management:"
echo "   Logs: docker compose logs -f app"
echo "   Stop: docker compose down"
echo "   Restart: docker compose restart app"
echo "=============================================="
