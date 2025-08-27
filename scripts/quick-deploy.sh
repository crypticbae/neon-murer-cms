#!/bin/bash

# =====================================
# NEON MURER CMS - QUICK DEPLOYMENT SCRIPT
# =====================================
# Automatisiertes Setup für Server-Deployment
# Führt alle notwendigen Schritte für Production-Deployment aus

set -e  # Exit on any error

echo "🚀 Starting Neon Murer CMS Quick Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =====================================
# CONFIGURATION
# =====================================
PROJECT_DIR="/opt/neon-murer-cms"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/logs/deployment.log"

# =====================================
# FUNCTIONS
# =====================================
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

check_requirements() {
    log "Checking system requirements..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as regular user with sudo access."
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        warning "User $USER is not in docker group. You may need to run with sudo."
    fi
    
    log "✅ System requirements check passed"
}

create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p {content/images,uploads,logs,backups/db,database/init,nginx/ssl,config}
    
    # Set permissions
    chmod 755 content uploads logs backups
    chmod 700 database/init nginx/ssl
    
    log "✅ Directories created successfully"
}

generate_secrets() {
    log "Generating secure secrets..."
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.production.template ]]; then
            cp .env.production.template .env
            log "Created .env from template"
        else
            error ".env.production.template not found"
        fi
    fi
    
    # Generate secure passwords if not set
    if ! grep -q "POSTGRES_PASSWORD=" .env || grep -q "YOUR_" .env; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')
        JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
        ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '\n')
        
        # Update .env file
        sed -i "s/YOUR_PRODUCTION_DATABASE_URL_HERE/postgresql:\/\/neon_user:${POSTGRES_PASSWORD}@localhost:5432\/neon_murer_cms/" .env
        sed -i "s/YOUR_SUPER_SECURE_JWT_SECRET_MINIMUM_64_CHARS_RANDOM_GENERATED/${JWT_SECRET}/" .env
        sed -i "s/YOUR_SUPER_SECURE_ADMIN_PASSWORD/${ADMIN_PASSWORD}/" .env
        
        echo "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" >> .env
        
        log "✅ Secure secrets generated and saved to .env"
        log "📋 Admin password: ${ADMIN_PASSWORD}"
        warning "Please save the admin password and update other settings in .env file!"
    fi
    
    chmod 600 .env
}

create_configs() {
    log "Creating configuration files..."
    
    # Redis configuration
    cat > config/redis.conf << 'EOF'
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF
    
    # Database init script
    cat > database/init/01-init.sql << 'EOF'
-- Neon Murer CMS Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOF
    
    log "✅ Configuration files created"
}

build_and_start() {
    log "Building and starting Docker containers..."
    
    # Build images
    log "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 30
    
    # Check if services are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    fi
    
    log "✅ Docker containers started successfully"
}

initialize_database() {
    log "Initializing database..."
    
    # Wait a bit more for database to be fully ready
    sleep 10
    
    # Run Prisma migrations
    log "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
    
    # Generate Prisma client
    log "Generating Prisma client..."
    docker-compose -f docker-compose.prod.yml exec -T app npx prisma generate
    
    # Seed database (optional)
    log "Seeding database..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run seed || warning "Database seeding failed, continuing..."
    
    # Create admin user
    log "Creating admin user..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run create-admin || warning "Admin user creation failed, continuing..."
    
    log "✅ Database initialized successfully"
}

run_health_checks() {
    log "Running health checks..."
    
    # Wait for application to be ready
    sleep 15
    
    # Check application health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log "✅ Application health check passed"
    else
        error "Application health check failed"
    fi
    
    # Check database connection
    if docker-compose -f docker-compose.prod.yml exec -T db psql -U neon_user -d neon_murer_cms -c "SELECT 1;" > /dev/null 2>&1; then
        log "✅ Database connection check passed"
    else
        error "Database connection check failed"
    fi
    
    # Check Redis connection
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping | grep -q PONG; then
        log "✅ Redis connection check passed"
    else
        warning "Redis connection check failed"
    fi
}

setup_backups() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/neon-murer-cms/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "Starting backup: $DATE"

# Database Backup
docker-compose -f /opt/neon-murer-cms/docker-compose.prod.yml exec -T db pg_dump -U neon_user neon_murer_cms > $BACKUP_DIR/db/backup_$DATE.sql

# Files Backup
cd /opt/neon-murer-cms
tar -czf $BACKUP_DIR/files_$DATE.tar.gz content/ uploads/

# Keep only last 30 backups
find $BACKUP_DIR/db/ -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR/ -name "files_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x scripts/backup.sh
    
    log "✅ Backup system configured"
}

print_summary() {
    log "🎉 Deployment completed successfully!"
    echo ""
    echo "=================================="
    echo "🌐 NEON MURER CMS DEPLOYMENT INFO"
    echo "=================================="
    echo "📍 Website: http://localhost:3001/"
    echo "🎛️  Admin Panel: http://localhost:3001/cms-admin/"
    echo "📊 API Health: http://localhost:3001/api/health"
    echo ""
    echo "🔐 Login Credentials:"
    echo "   Email: $(grep ADMIN_EMAIL .env | cut -d'=' -f2 | tr -d '"')"
    echo "   Password: $(grep ADMIN_PASSWORD .env | cut -d'=' -f2 | tr -d '"')"
    echo ""
    echo "📁 Important Files:"
    echo "   Environment: $(pwd)/.env"
    echo "   Logs: $(pwd)/logs/"
    echo "   Backups: $(pwd)/backups/"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f app"
    echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
    echo "   Stop: docker-compose -f docker-compose.prod.yml down"
    echo "   Backup: ./scripts/backup.sh"
    echo ""
    echo "📚 Documentation: ./SERVER-DEPLOYMENT-GUIDE.md"
    echo "=================================="
}

# =====================================
# MAIN EXECUTION
# =====================================
main() {
    echo "🚀 Neon Murer CMS Quick Deployment Script"
    echo "=========================================="
    
    # Create log directory
    mkdir -p logs
    
    # Run deployment steps
    check_requirements
    create_directories
    generate_secrets
    create_configs
    build_and_start
    initialize_database
    run_health_checks
    setup_backups
    print_summary
    
    log "✅ Deployment script completed successfully!"
}

# Check if Docker Compose file exists
if [[ ! -f "docker-compose.prod.yml" ]]; then
    error "docker-compose.prod.yml not found. Please run this script from the project root directory."
fi

# Run main function
main "$@"
