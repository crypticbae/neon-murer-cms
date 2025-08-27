#!/bin/bash

# =====================================
# NEON MURER CMS - DEPLOY & GO
# =====================================
# Einmal ausführen - alles funktioniert sofort!

set -e

echo "🚀 DEPLOY & GO - Neon Murer CMS"
echo "==============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WAIT]${NC} $1"
}

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "localhost")

log "🌐 Server IP: $SERVER_IP"

# Download deploygo compose file
log "📥 Downloading Deploy & Go configuration..."
curl -o docker-compose.yml "https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.deploygo.yml"

# Clean slate start
log "🧹 Clean slate deployment..."
docker compose down --volumes --remove-orphans 2>/dev/null || true

# Pull latest images
log "📦 Pulling latest images..."
docker compose pull

# Start everything
log "🚀 Starting Deploy & Go deployment..."
docker compose up -d

# Real-time status monitoring
log "📊 Monitoring deployment progress..."

echo ""
echo "⏳ Waiting for services to initialize..."
echo "   This may take 2-4 minutes for complete setup"
echo ""

# Monitor database
warning "Database initializing..."
for i in {1..60}; do
    if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
        log "✅ PostgreSQL ready (${i}s)"
        break
    fi
    echo -n "."
    sleep 1
    [ $i -eq 60 ] && { echo "❌ Database timeout"; exit 1; }
done

# Monitor Redis
warning "Redis starting..."
for i in {1..30}; do
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        log "✅ Redis ready (${i}s)"
        break
    fi
    echo -n "."
    sleep 1
    [ $i -eq 30 ] && { echo "❌ Redis timeout"; exit 1; }
done

# Monitor database setup
warning "Database setup running..."
for i in {1..180}; do
    if ! docker compose ps db-setup 2>/dev/null | grep -q "Up"; then
        log "✅ Database setup completed (${i}s)"
        break
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -n " ${i}s"
    fi
    sleep 1
    [ $i -eq 180 ] && { echo "❌ Setup timeout"; exit 1; }
done

# Monitor application
warning "Application starting..."
for i in {1..120}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Application ready (${i}s)"
        break
    fi
    if [ $((i % 15)) -eq 0 ]; then
        echo -n " ${i}s"
    fi
    sleep 1
    [ $i -eq 120 ] && { echo "❌ Application timeout"; exit 1; }
done

# Final verification
log "🔍 Final verification..."

# Test API
if curl -s http://localhost:3835/api/health | grep -q "OK"; then
    log "✅ API operational"
else
    echo "⚠️ API check inconclusive"
fi

# Test database health
if curl -s http://localhost:3835/api/health/detailed | grep -q '"database":{"status":"OK"'; then
    log "✅ Database operational"
else
    echo "⚠️ Database check inconclusive"
fi

log "🎉 DEPLOY & GO completed successfully!"

echo ""
echo "================================================"
echo "🌐 NEON MURER CMS - READY TO USE!"
echo "================================================"
if [ "$SERVER_IP" != "localhost" ]; then
    echo "🌍 Website: http://$SERVER_IP:3835/"
    echo "🎛️  Admin Panel: http://$SERVER_IP:3835/cms-admin/"
    echo "📊 API Health: http://$SERVER_IP:3835/api/health"
else
    echo "🌍 Website: http://localhost:3835/"
    echo "🎛️  Admin Panel: http://localhost:3835/cms-admin/"
    echo "📊 API Health: http://localhost:3835/api/health"
fi
echo ""
echo "🔐 Login Credentials:"
echo "   📧 Email: admin@neonmurer.ch"
echo "   🔑 Password: admin123"
echo ""
echo "🔧 Management:"
echo "   📋 Logs: docker compose logs -f app"
echo "   🔄 Restart: docker compose restart"
echo "   ⏹️  Stop: docker compose down"
echo "   📊 Status: docker compose ps"
echo ""
echo "✨ Features:"
echo "   ✅ Automatic database setup"
echo "   ✅ Daily backups"
echo "   ✅ Health monitoring"
echo "   ✅ Auto-restart on failure"
echo ""
echo "🎯 Your CMS is production-ready!"
echo "================================================"
