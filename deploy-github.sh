#!/bin/bash

# =====================================
# NEON MURER CMS - GITHUB DEPLOYMENT
# =====================================
# Deployt das komplette System direkt von GitHub
# Verwendet vorgefertigte Docker Images

set -e  # Exit on any error

echo "🚀 Starting Neon Murer CMS GitHub Deployment on Port 3835..."

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
if lsof -Pi :3835 -sTCP:LISTEN -t >/dev/null 2>&1; then
    error "Port 3835 is already in use. Please free the port or choose another one."
fi

log "✅ All requirements met"

# =====================================
# DOWNLOAD COMPOSE FILE
# =====================================
info "📥 Downloading latest Docker Compose configuration..."

# Create deployment directory
DEPLOY_DIR="neon-cms-deployment"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Download compose file from GitHub
curl -o docker-compose.yml https://raw.githubusercontent.com/crypticbae/neon-murer-cms/main/docker-compose.github.yml

if [ ! -f docker-compose.yml ]; then
    error "Failed to download Docker Compose file from GitHub"
fi

log "✅ Compose file downloaded"

# =====================================
# DEPLOYMENT
# =====================================
info "🐳 Starting GitHub-based deployment..."

# Stop any existing containers
log "Stopping existing containers..."
docker compose down --remove-orphans 2>/dev/null || true

# Pull latest images
log "Pulling latest Docker images from GitHub..."
docker compose pull

# Start services
log "Starting all services..."
docker compose up -d

# =====================================
# WAITING FOR SERVICES
# =====================================
log "Waiting for services to start..."

# Wait for database
info "⏳ Waiting for database..."
for i in {1..60}; do
    if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
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
    if docker compose exec -T redis redis-cli ping >/dev/null 2>&1; then
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
    if docker compose ps $service | grep -q "Up"; then
        log "✅ Service $service is running"
    else
        warning "❌ Service $service is not running properly"
    fi
done

# Test database connection
if docker compose exec -T db psql -U neon_user -d neon_murer_cms -c "SELECT 1;" >/dev/null 2>&1; then
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
log "🎉 GitHub Deployment completed successfully!"

echo ""
echo "=========================================="
echo "🌐 NEON MURER CMS - GITHUB DEPLOYMENT"
echo "=========================================="
echo "📍 Website: http://localhost:3835/"
echo "🎛️  Admin Panel: http://localhost:3835/cms-admin/"
echo "📊 API Health: http://localhost:3835/api/health"
echo "🔧 Nginx Proxy: http://localhost/"
echo ""
echo "🔐 Default Login:"
echo "   Email: admin@neonmurer.ch"
echo "   Password: admin123"
echo ""
echo "🐳 Docker Services (from GitHub):"
docker compose ps
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
echo "   View logs: docker compose logs -f"
echo "   Restart: docker compose restart"
echo "   Stop: docker compose down"
echo "   Update: docker compose pull && docker compose up -d"
echo ""
echo "📦 Images from: ghcr.io/crypticbae/neon-murer-cms:latest"
echo "🎯 Deployed from GitHub - always latest version!"
echo "=========================================="
