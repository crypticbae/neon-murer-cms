#!/bin/bash

# =====================================
# NEON MURER CMS - DATENBANK REPARATUR
# =====================================
# Behebt Datenbank-Initialisierungsprobleme

set -e

echo "🔧 Repariere Neon Murer CMS Datenbank..."

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
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if docker compose is running
if ! docker compose ps | grep -q "Up"; then
    error "Docker Compose ist nicht gestartet. Bitte starte zuerst: docker compose up -d"
    exit 1
fi

log "🔍 Überprüfe aktuellen Datenbankstatus..."

# Check database connection
if docker compose exec -T db pg_isready -U neon_user >/dev/null 2>&1; then
    log "✅ PostgreSQL läuft"
else
    error "❌ PostgreSQL nicht erreichbar"
    exit 1
fi

# Check if tables exist
TABLE_COUNT=$(docker compose exec -T db psql -U neon_user -d neon_murer_cms -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")

log "📊 Gefundene Tabellen: $TABLE_COUNT"

if [ "$TABLE_COUNT" -lt 5 ]; then
    warning "❌ Datenbank ist nicht korrekt initialisiert"
    
    log "🔄 Starte Datenbank-Reparatur..."
    
    # Stop existing db-init if running
    docker compose stop db-init 2>/dev/null || true
    docker compose rm -f db-init 2>/dev/null || true
    
    # Run database initialization
    log "🗄️  Führe Prisma Migrations aus..."
    docker compose run --rm --name neon-db-repair \
        -e NODE_ENV=staging \
        -e DATABASE_URL=postgresql://neon_user:neon_secure_password_2024@db:5432/neon_murer_cms \
        app sh -c "
        echo 'Running Prisma migrations...'
        npx prisma migrate deploy
        echo 'Generating Prisma client...'
        npx prisma generate
        echo 'Database migration completed!'
        "
    
    log "🌱 Führe Database Seeding aus..."
    docker compose run --rm --name neon-db-seed \
        -e NODE_ENV=staging \
        -e DATABASE_URL=postgresql://neon_user:neon_secure_password_2024@db:5432/neon_murer_cms \
        -e ADMIN_EMAIL=admin@neonmurer.ch \
        -e ADMIN_PASSWORD=admin123 \
        -e ADMIN_NAME=Administrator \
        -e JWT_SECRET=xgI2MNdFDPbViz5IPEqBp/8IYqgzNnM0tXfVDnq+r5szkS6Qxdy1r/oJoKYLzKuL \
        app sh -c "
        echo 'Seeding database...'
        npm run seed
        echo 'Database seeding completed!'
        "
    
    # Verify repair
    NEW_TABLE_COUNT=$(docker compose exec -T db psql -U neon_user -d neon_murer_cms -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$NEW_TABLE_COUNT" -gt 10 ]; then
        log "✅ Datenbank erfolgreich repariert! Tabellen: $NEW_TABLE_COUNT"
    else
        error "❌ Datenbank-Reparatur fehlgeschlagen"
        exit 1
    fi
else
    log "✅ Datenbank bereits korrekt initialisiert"
fi

# Restart application to refresh connections
log "🔄 Starte Anwendung neu..."
docker compose restart app

# Wait for app to be ready
info "⏳ Warte auf Anwendung..."
for i in {1..30}; do
    if curl -s http://localhost:3835/api/health >/dev/null 2>&1; then
        log "✅ Anwendung ist bereit"
        break
    fi
    if [ $i -eq 30 ]; then
        error "❌ Anwendung startet nicht"
        exit 1
    fi
    sleep 2
done

# Final verification
log "🔍 Finale Verifikation..."

# Test API health
if curl -s http://localhost:3835/api/health | grep -q "OK"; then
    log "✅ API Health Check erfolgreich"
else
    error "❌ API Health Check fehlgeschlagen"
fi

# Test database connection
if curl -s http://localhost:3835/api/health/detailed | grep -q '"database":{"status":"OK"'; then
    log "✅ Datenbank-Verbindung erfolgreich"
else
    warning "⚠️  Datenbank-Verbindung möglicherweise noch nicht bereit"
fi

# Test settings API
if curl -s "http://localhost:3835/api/settings?category=general" | grep -q '\['; then
    log "✅ Settings API funktioniert"
else
    warning "⚠️  Settings API antwortet nicht korrekt"
fi

log "🎉 Datenbank-Reparatur abgeschlossen!"

echo ""
echo "=============================================="
echo "🔧 DATENBANK REPARATUR ABGESCHLOSSEN"
echo "=============================================="
echo "🌐 Website: http://51.77.68.64:3835/"
echo "🎛️  Admin Panel: http://51.77.68.64:3835/cms-admin/"
echo "📊 API Health: http://51.77.68.64:3835/api/health"
echo ""
echo "🔐 Login Daten:"
echo "   📧 Email: admin@neonmurer.ch"
echo "   🔑 Password: admin123"
echo ""
echo "🔧 Nützliche Befehle:"
echo "   📋 Logs anzeigen: docker compose logs -f app"
echo "   🔄 Neustart: docker compose restart app"
echo "   📊 Status: docker compose ps"
echo "=============================================="
