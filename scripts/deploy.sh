#!/bin/bash

# 🚀 Neon Murer CMS - Deployment Script
# Usage: ./scripts/deploy.sh [platform]
# Platforms: railway, vercel, render, docker

set -e

PLATFORM=${1:-railway}
echo "🚀 Deploying Neon Murer CMS to: $PLATFORM"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher required"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Run from project root."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Validate environment
validate_environment() {
    log_info "Validating environment configuration..."
    
    if [ -f ".env" ]; then
        log_warning ".env file found. Don't commit this to git!"
    fi
    
    # Check if required environment variables are set for production
    if [ "$NODE_ENV" = "production" ]; then
        if [ -z "$DATABASE_URL" ]; then
            log_error "DATABASE_URL not set for production"
            exit 1
        fi
        
        if [ -z "$JWT_SECRET" ]; then
            log_error "JWT_SECRET not set for production"
            exit 1
        fi
    fi
    
    log_success "Environment validation passed"
}

# Build and test
build_and_test() {
    log_info "Building and testing application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npm run generate
    
    # Run tests
    if [ "$SKIP_TESTS" != "true" ]; then
        log_info "Running tests..."
        npm test
    fi
    
    # Validate environment config
    log_info "Validating environment configuration..."
    npm run env:validate
    
    log_success "Build and test completed"
}

# Platform-specific deployments
deploy_railway() {
    log_info "Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        log_warning "Railway CLI not installed. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login check
    if ! railway whoami &> /dev/null; then
        log_info "Please login to Railway:"
        railway login
    fi
    
    # Deploy
    railway up
    
    log_success "Railway deployment completed"
}

deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not installed. Installing..."
        npm install -g vercel
    fi
    
    # Deploy
    vercel --prod
    
    log_success "Vercel deployment completed"
}

deploy_render() {
    log_info "Deploying to Render..."
    
    if [ ! -f "render.yaml" ]; then
        log_error "render.yaml not found. Please create it first."
        exit 1
    fi
    
    log_info "Push your changes to git to trigger Render deployment:"
    echo "git add ."
    echo "git commit -m 'Deploy to Render'"
    echo "git push origin main"
    
    log_success "Render deployment instructions shown"
}

deploy_docker() {
    log_info "Building Docker image..."
    
    # Build image
    docker build -t neon-murer-cms .
    
    # Start with docker-compose
    if [ -f "docker-compose.yml" ]; then
        log_info "Starting with docker-compose..."
        docker-compose up -d
        
        # Wait for services to be ready
        sleep 10
        
        # Run migrations
        log_info "Running database migrations..."
        docker-compose exec app npm run migrate:deploy
        
        # Optional: Seed data
        if [ "$SEED_DATA" = "true" ]; then
            log_info "Seeding database..."
            docker-compose exec app npm run seed
        fi
        
        log_success "Docker deployment completed"
        log_info "Application available at: http://localhost:3001"
    else
        log_error "docker-compose.yml not found"
        exit 1
    fi
}

# Health check after deployment
health_check() {
    local url=$1
    log_info "Running health check on: $url"
    
    # Wait a bit for deployment to be ready
    sleep 30
    
    # Check health endpoint
    if curl -f -s "$url/api/health" > /dev/null; then
        log_success "Health check passed"
    else
        log_warning "Health check failed. Check logs."
    fi
}

# Main deployment flow
main() {
    echo "🎯 Neon Murer CMS Deployment"
    echo "Platform: $PLATFORM"
    echo ""
    
    check_prerequisites
    validate_environment
    build_and_test
    
    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        vercel)
            deploy_vercel
            ;;
        render)
            deploy_render
            ;;
        docker)
            deploy_docker
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            echo "Supported platforms: railway, vercel, render, docker"
            exit 1
            ;;
    esac
    
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test your application"
    echo "2. Update DNS settings if needed"
    echo "3. Configure monitoring"
    echo "4. Set up backups"
}

# Run main function
main
