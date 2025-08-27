#!/bin/bash

# =====================================
# NEON MURER CMS - ONE-CLICK STANDALONE DEPLOYMENT
# =====================================
# Deployt das komplette System auf Port 3835
# ALLES in Docker - keine externen Abhängigkeiten!

set -e  # Exit on any error

echo "🚀 Starting Neon Murer CMS Standalone Deployment on Port 3835..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# =====================================
# CHECKS
# =====================================
log "Checking requirements..."

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if port 3835 is available
if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null ; then
    error "Port 3835 is already in use. Please free the port or choose another one."
fi

log "✅ All requirements met"

# =====================================
# DEPLOYMENT
# =====================================
info "🐳 Starting Docker deployment..."

# Stop any existing containers
log "Stopping existing containers..."
docker-compose -f docker-compose.standalone.yml down --remove-orphans 2>/dev/null || true

# Remove old volumes (optional - uncomment if you want fresh start)
# docker volume prune -f

# Build and start services
log "Building and starting all services..."
docker-compose -f docker-compose.standalone.yml up -d --build

# =====================================
# WAITING FOR SERVICES
# =====================================
log "Waiting for services to start..."

# Wait for database
info "⏳ Waiting for database..."
for i in {1..60}; do
    if docker-compose -f docker-compose.standalone.yml exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
        log "✅ Database is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        error "Database failed to start within 60 seconds"
    fi
    sleep 1
done

# Wait for Redis
info "⏳ Waiting for Redis..."
for i in {1..30}; do
    if docker-compose -f docker-compose.standalone.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
        log "✅ Redis is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        error "Redis failed to start within 30 seconds"
    fi
    sleep 1
done

# Wait for application
info "⏳ Waiting for application..."
for i in {1..120}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Application is ready"
        break
    fi
    if [ $i -eq 120 ]; then
        error "Application failed to start within 120 seconds"
    fi
    sleep 1
done

# =====================================
# VERIFICATION
# =====================================
log "🔍 Running verification checks..."

# Check all services
SERVICES=("app" "db" "redis" "nginx")
for service in "${SERVICES[@]}"; do
    if docker-compose -f docker-compose.standalone.yml ps $service | grep -q "Up"; then
        log "✅ Service $service is running"
    else
        warning "❌ Service $service is not running properly"
    fi
done

# Test database connection
if docker-compose -f docker-compose.standalone.yml exec -T db psql -U neon_user -d neon_murer_cms -c "SELECT 1;" >/dev/null 2>&1; then
    log "✅ Database connection successful"
else
    warning "❌ Database connection failed"
fi

# Test API endpoints
if curl -s http://localhost:3835/api/health | grep -q "ok"; then
    log "✅ API health check passed"
else
    warning "❌ API health check failed"
fi

# =====================================
# SUCCESS MESSAGE
# =====================================
log "🎉 Deployment completed successfully!"

echo ""
echo "=========================================="
echo "🌐 NEON MURER CMS - DEPLOYMENT COMPLETE"
echo "=========================================="
echo "📍 Website: http://localhost:3835/"
echo "🎛️  Admin Panel: http://localhost:3835/cms-admin/"
echo "📊 API Health: http://localhost:3835/api/health"
echo "🔧 Nginx Proxy: http://localhost/"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@neonmurer.ch"
echo "   Password: admin_secure_2024"
echo ""
echo "🐳 Docker Services:"
docker-compose -f docker-compose.standalone.yml ps
echo ""
echo "📊 Service Status:"
echo "   ✅ PostgreSQL Database (Port 5432)"
echo "   ✅ Redis Cache (Port 6379)"  
echo "   ✅ Node.js Application (Port 3835)"
echo "   ✅ Nginx Reverse Proxy (Port 80)"
echo "   ✅ Automated Backups"
echo "   ✅ Health Monitoring"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose -f docker-compose.standalone.yml logs -f"
echo "   Restart: docker-compose -f docker-compose.standalone.yml restart"
echo "   Stop: docker-compose -f docker-compose.standalone.yml down"
echo "   Update: ./deploy-standalone.sh"
echo ""
echo "📁 Data Volumes:"
echo "   Database: postgres_data"
echo "   Redis: redis_data"
echo "   Content: app_content"
echo "   Uploads: app_uploads"
echo "   Logs: app_logs"
echo "   Backups: app_backups, db_backups"
echo ""
echo "🎯 Everything is containerized and running on port 3835!"
echo "=========================================="
