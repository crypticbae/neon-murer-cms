#!/bin/bash

# =====================================
# NEON MURER CMS - BULLETPROOF DEPLOYMENT
# =====================================
# GARANTIERT FUNKTIONSFÄHIG - KEIN BUILD!

set -e

echo "🛡️  BULLETPROOF Deployment - Port 3835"
echo "======================================"
echo "✅ Kein Docker Build"
echo "✅ Nutzt ZIP Download statt git clone"
echo "✅ Robuste npm install Flags"
echo "✅ Ausführliche Logs"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
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

success() {
    echo -e "${PURPLE}[SUCCESS]${NC} $1"
}

# Pre-flight checks
log "🔍 Pre-flight checks..."

if ! command -v docker &> /dev/null; then
    error "Docker not found. Please install Docker first."
fi

if ! command -v curl &> /dev/null; then
    error "curl not found. Please install curl first."
fi

# Check port availability
if command -v lsof &> /dev/null; then
    if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null 2>&1; then
        error "Port 3835 already in use. Please stop the service using this port."
    fi
elif command -v netstat &> /dev/null; then
    if netstat -an 2>/dev/null | grep ":3835 " | grep -q LISTEN; then
        error "Port 3835 already in use. Please stop the service using this port."
    fi
fi

success "All pre-flight checks passed"

# Download compose file
log "📥 Downloading bulletproof compose file..."
curl -o docker-compose.yml "https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.bulletproof.yml"

if [ ! -f docker-compose.yml ]; then
    error "Failed to download docker-compose.yml"
fi

success "Compose file downloaded"

# Clean up existing deployment
log "🧹 Cleaning up any existing deployment..."
docker compose down --remove-orphans --volumes 2>/dev/null || true
docker system prune -f 2>/dev/null || true

success "Cleanup completed"

# Start deployment
log "🚀 Starting bulletproof deployment..."
info "This method uses:"
info "  • ZIP download instead of git clone"
info "  • Robust npm install with --legacy-peer-deps"
info "  • Verbose logging for debugging"
info "  • No Docker build step"

docker compose up -d

log "⏳ Waiting for services to initialize..."

# Enhanced waiting with better feedback
info "Waiting for PostgreSQL database..."
for i in {1..90}; do
    if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
        success "Database is ready (${i}s)"
        break
    fi
    if [ $i -eq 90 ]; then
        error "Database failed to start within 90 seconds"
    fi
    echo -n "."
    sleep 1
done

info "Waiting for Redis cache..."
for i in {1..45}; do
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        success "Redis is ready (${i}s)"
        break
    fi
    if [ $i -eq 45 ]; then
        error "Redis failed to start within 45 seconds"
    fi
    echo -n "."
    sleep 1
done

info "Waiting for database initialization to complete..."
for i in {1..300}; do
    if ! docker compose ps db-init 2>/dev/null | grep -q "Up"; then
        success "Database initialization completed (${i}s)"
        break
    fi
    if [ $i -eq 300 ]; then
        error "Database initialization timed out after 5 minutes"
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -n " ${i}s"
    fi
    sleep 1
done

info "Waiting for application to start..."
for i in {1..240}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        success "Application is ready (${i}s)"
        break
    fi
    if [ $i -eq 240 ]; then
        error "Application failed to start within 4 minutes"
    fi
    if [ $((i % 15)) -eq 0 ]; then
        echo -n " ${i}s"
    fi
    sleep 1
done

# Final verification
log "🔍 Running final verification..."

# Test API health
if curl -s http://localhost:3835/api/health | grep -q "ok"; then
    success "API health check passed"
else
    error "API health check failed"
fi

# Test database
if docker compose exec -T db psql -U neon_user -d neon_murer_cms -c "SELECT 1;" >/dev/null 2>&1; then
    success "Database connectivity verified"
else
    error "Database connectivity failed"
fi

# Check all services
SERVICES=("app" "db" "redis")
for service in "${SERVICES[@]}"; do
    if docker compose ps $service | grep -q "Up"; then
        success "Service $service is running"
    else
        error "Service $service is not running"
    fi
done

log "🎉 Bulletproof deployment completed successfully!"

echo ""
echo "================================================"
echo "🛡️  NEON MURER CMS - BULLETPROOF & READY!"
echo "================================================"
echo "🌐 Website: http://localhost:3835/"
echo "🎛️  Admin Panel: http://localhost:3835/cms-admin/"
echo "📊 API Health: http://localhost:3835/api/health"
echo ""
echo "🔐 Default Login Credentials:"
echo "   📧 Email: admin@neonmurer.ch"
echo "   🔑 Password: admin123"
echo ""
echo "🐳 Running Services:"
docker compose ps
echo ""
echo "📊 Quick Status Check:"
echo -n "   Database: "
if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Online${NC}"
else
    echo -e "${RED}❌ Offline${NC}"
fi
echo -n "   Redis: "
if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Online${NC}"
else
    echo -e "${RED}❌ Offline${NC}"
fi
echo -n "   Application: "
if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Online${NC}"
else
    echo -e "${RED}❌ Offline${NC}"
fi
echo ""
echo "🔧 Management Commands:"
echo "   📋 View logs: docker compose logs -f app"
echo "   🔄 Restart: docker compose restart"
echo "   ⏹️  Stop: docker compose down"
echo "   📊 Status: docker compose ps"
echo ""
echo "🎯 Your CMS is bulletproof and running on port 3835!"
echo "================================================"
