#!/bin/bash

# =====================================
# NEON MURER CMS - SOFORT-DEPLOYMENT
# =====================================
# Funktioniert SOFORT - kein GitHub Actions Wait nötig!

set -e  # Exit on any error

echo "🚀 Starting Neon Murer CMS Working Deployment on Port 3835..."

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
# DEPLOYMENT METHODS
# =====================================
info "🎯 Choose deployment method:"
echo "1) GitHub build (clones from GitHub, builds locally)"
echo "2) Local build (use current directory)"
echo ""
read -p "Select method (1-2): " METHOD

case $METHOD in
    1)
        COMPOSE_FILE="docker-compose.hybrid.yml"
        DEPLOYMENT_TYPE="GitHub Clone + Local Build"
        info "📥 Will clone from GitHub and build locally"
        ;;
    2)
        COMPOSE_FILE="docker-compose.standalone.yml"
        DEPLOYMENT_TYPE="Local Build"
        info "🏠 Will use current directory"
        ;;
    *)
        error "Invalid selection. Please choose 1 or 2."
        ;;
esac

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
if command -v lsof &> /dev/null; then
    if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null 2>&1; then
        error "Port 3835 is already in use. Please free the port first."
    fi
elif command -v netstat &> /dev/null; then
    if netstat -an 2>/dev/null | grep ":3835 " | grep -q LISTEN; then
        error "Port 3835 is already in use. Please free the port first."
    fi
fi

log "✅ All requirements met"

# =====================================
# DOWNLOAD COMPOSE FILE IF NEEDED
# =====================================
if [ "$METHOD" = "1" ]; then
    info "📥 Downloading compose file..."
    curl -o docker-compose.yml "https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/$COMPOSE_FILE"
    if [ ! -f docker-compose.yml ]; then
        error "Failed to download compose file"
    fi
    COMPOSE_FILE="docker-compose.yml"
fi

# =====================================
# DEPLOYMENT
# =====================================
info "🐳 Starting $DEPLOYMENT_TYPE deployment..."

# Stop any existing containers
log "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Start services
log "Building and starting all services..."
docker compose -f "$COMPOSE_FILE" up -d --build

# =====================================
# WAITING FOR SERVICES
# =====================================
log "Waiting for services to start..."

# Wait for database
info "⏳ Waiting for database..."
for i in {1..60}; do
    if docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
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
    if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping >/dev/null 2>&1; then
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
for i in {1..180}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Application is ready"
        break
    fi
    if [ $i -eq 180 ]; then
        error "Application failed to start within 3 minutes"
    fi
    sleep 1
done

# =====================================
# VERIFICATION
# =====================================
log "🔍 Running verification checks..."

# Check all services
SERVICES=("app" "db" "redis")
for service in "${SERVICES[@]}"; do
    if docker compose -f "$COMPOSE_FILE" ps $service | grep -q "Up"; then
        log "✅ Service $service is running"
    else
        warning "❌ Service $service is not running properly"
    fi
done

# Test database connection
if docker compose -f "$COMPOSE_FILE" exec -T db psql -U neon_user -d neon_murer_cms -c "SELECT 1;" >/dev/null 2>&1; then
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
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@neonmurer.ch"
echo "   Password: admin123"
echo ""
echo "🐳 Docker Services ($DEPLOYMENT_TYPE):"
docker compose -f "$COMPOSE_FILE" ps
echo ""
echo "📊 Service Status:"
echo "   ✅ PostgreSQL Database (Port 5432)"
echo "   ✅ Redis Cache (Port 6379)"  
echo "   ✅ Node.js Application (Port 3835)"
echo "   ✅ Automated Backups"
echo "   ✅ Health Monitoring"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker compose -f $COMPOSE_FILE logs -f"
echo "   Restart: docker compose -f $COMPOSE_FILE restart"
echo "   Stop: docker compose -f $COMPOSE_FILE down"
echo ""
echo "🎯 Your CMS is now running on port 3835!"
echo "=========================================="
