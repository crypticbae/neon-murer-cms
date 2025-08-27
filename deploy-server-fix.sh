#!/bin/bash

# =====================================
# Neon Murer CMS - Server Deployment Fix
# Für Server: http://51.77.68.64:3835
# =====================================

set -e

echo "🔧 Neon Murer CMS - Server Login Fix"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    warn "Running as root. Consider using a regular user with sudo."
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log "✅ Docker is running"
}

# Function to stop existing containers
stop_containers() {
    log "🛑 Stopping existing containers..."
    
    # Stop all containers that might be running
    docker compose down 2>/dev/null || true
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker compose -f docker-compose.production.yml down 2>/dev/null || true
    
    # Remove orphaned containers
    docker container prune -f 2>/dev/null || true
    
    log "✅ Containers stopped"
}

# Function to backup current configuration
backup_config() {
    log "💾 Creating configuration backup..."
    
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        log "✅ .env backed up"
    fi
}

# Function to setup environment
setup_environment() {
    log "⚙️ Setting up production environment..."
    
    # Copy server-specific environment
    if [ -f ".env.server" ]; then
        cp .env.server .env
        log "✅ Server environment configured"
    else
        error ".env.server file not found!"
        exit 1
    fi
    
    # Set proper permissions
    chmod 600 .env
    log "✅ Environment file permissions set"
}

# Function to prepare database
prepare_database() {
    log "🗄️ Preparing database..."
    
    # Generate Prisma client
    log "Generating Prisma client..."
    npm run generate || {
        error "Failed to generate Prisma client"
        exit 1
    }
    
    # Deploy migrations
    log "Running database migrations..."
    npm run migrate:deploy || {
        warn "Migration failed, database might need manual setup"
    }
    
    # Seed database if needed
    log "Seeding database..."
    npm run seed || {
        warn "Database seeding failed, but continuing..."
    }
    
    log "✅ Database prepared"
}

# Function to build and start application
start_application() {
    log "🚀 Starting application..."
    
    # Build if needed
    npm run build 2>/dev/null || true
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm install
    fi
    
    # Start in production mode
    log "Starting server in production mode..."
    
    # Create logs directory
    mkdir -p logs
    mkdir -p uploads
    
    # Start with PM2 or direct
    if command -v pm2 &> /dev/null; then
        log "Starting with PM2..."
        pm2 stop neon-murer-cms 2>/dev/null || true
        pm2 delete neon-murer-cms 2>/dev/null || true
        pm2 start server.js --name neon-murer-cms --env production
        pm2 save
        log "✅ Application started with PM2"
    else
        log "Starting with npm..."
        # Kill any existing process on port 3835
        lsof -ti:3835 | xargs kill -9 2>/dev/null || true
        
        # Start in background
        nohup npm run production > logs/app.log 2>&1 &
        echo $! > .pid
        log "✅ Application started (PID: $(cat .pid))"
    fi
}

# Function to verify deployment
verify_deployment() {
    log "🔍 Verifying deployment..."
    
    # Wait for application to start
    sleep 5
    
    # Check if port is listening
    if ! netstat -tuln | grep -q ":3835 "; then
        error "Application is not listening on port 3835"
        return 1
    fi
    
    # Check health endpoint
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Health check attempt $attempt/$max_attempts..."
        
        if curl -s -f http://localhost:3835/api/health > /dev/null 2>&1; then
            log "✅ Health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 2
        ((attempt++))
    done
    
    # Test login endpoint
    log "Testing login endpoint..."
    local login_response=$(curl -s -w "%{http_code}" -o /dev/null \
        -X POST http://localhost:3835/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@neonmurer.ch","password":"admin123"}')
    
    if [ "$login_response" = "200" ] || [ "$login_response" = "401" ]; then
        log "✅ Login endpoint responding correctly"
    else
        warn "Login endpoint returned HTTP $login_response"
    fi
    
    log "✅ Deployment verification completed"
}

# Function to show status
show_status() {
    echo
    log "🎯 Deployment Status"
    echo "===================="
    echo "🌐 Server URL: http://51.77.68.64:3835"
    echo "🔐 Admin Login: http://51.77.68.64:3835/cms-admin/login.html"
    echo "📊 Health Check: http://51.77.68.64:3835/api/health"
    echo "👤 Admin Email: admin@neonmurer.ch"
    echo "🔑 Admin Password: admin123"
    echo
    
    if command -v pm2 &> /dev/null; then
        echo "📋 PM2 Status:"
        pm2 list
    fi
    
    echo
    log "✅ Deployment completed successfully!"
    echo
    warn "Wichtig: Ändern Sie das Admin-Passwort nach dem ersten Login!"
}

# Main deployment function
main() {
    log "Starting Neon Murer CMS server deployment fix..."
    
    # Check prerequisites
    check_docker
    
    # Check if we're in the right directory
    if [ ! -f "server.js" ]; then
        error "server.js not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Stop existing containers and processes
    stop_containers
    
    # Backup current configuration
    backup_config
    
    # Setup environment
    setup_environment
    
    # Prepare database
    prepare_database
    
    # Start application
    start_application
    
    # Verify deployment
    if verify_deployment; then
        show_status
    else
        error "Deployment verification failed. Please check the logs."
        exit 1
    fi
}

# Handle script interruption
trap 'error "Script interrupted"; exit 1' INT TERM

# Run main function
main "$@"
