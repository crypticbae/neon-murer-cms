#!/bin/bash

echo "🔧 Quick Database Fix für Neon Murer CMS"

# Stop db-init if running
docker compose stop db-init 2>/dev/null || true
docker compose rm -f db-init 2>/dev/null || true

echo "🗄️ Führe manuelle Datenbank-Initialisierung aus..."

# Manual database initialization with proper shell execution
docker compose run --rm --name neon-quick-fix \
  -e NODE_ENV=staging \
  -e DATABASE_URL=postgresql://neon_user:neon_secure_password_2024@db:5432/neon_murer_cms \
  -e ADMIN_EMAIL=admin@neonmurer.ch \
  -e ADMIN_PASSWORD=admin123 \
  -e ADMIN_NAME=Administrator \
  -e JWT_SECRET=xgI2MNdFDPbViz5IPEqBp/8IYqgzNnM0tXfVDnq+r5szkS6Qxdy1r/oJoKYLzKuL \
  app /bin/sh -c "
    echo '🔄 Running Prisma migrations...'
    npx prisma migrate deploy
    echo '⚙️ Generating Prisma client...'
    npx prisma generate  
    echo '🌱 Seeding database...'
    npm run seed
    echo '✅ Database initialization completed!'
  "

echo "🔄 Restarte App..."
docker compose restart app

echo "⏳ Warte 10 Sekunden..."
sleep 10

echo "🔍 Teste API..."
curl -s http://localhost:3835/api/health

echo ""
echo "✅ Quick Fix abgeschlossen!"
echo "🌐 Website: http://51.77.68.64:3835/"
echo "🎛️ Admin: http://51.77.68.64:3835/cms-admin/"
