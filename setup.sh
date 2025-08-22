#!/bin/bash

echo "🌟 Neon Murer CMS Setup"
echo "======================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert. Bitte installiere Node.js v18 oder höher."
    echo "Download: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js Version zu alt. Mindestens v18 erforderlich."
    exit 1
fi

echo "✅ Node.js $(node -v) gefunden"

# Install dependencies
echo "📦 Installiere Dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "⚙️ Erstelle .env Datei..."
    cp .env.example .env
    echo "📝 Bitte bearbeite die .env Datei mit deinen Datenbank-Einstellungen:"
    echo "   nano .env"
    echo ""
    echo "Wichtige Einstellungen:"
    echo "- DATABASE_URL: PostgreSQL Verbindungsstring"
    echo "- JWT_SECRET: Sicherer Secret-Key"
    echo "- ADMIN_EMAIL: Admin E-Mail Adresse"
    echo "- ADMIN_PASSWORD: Admin Passwort"
    echo ""
    read -p "Drücke Enter wenn du die .env Datei konfiguriert hast..."
fi

# Generate Prisma client
echo "🔧 Generiere Prisma Client..."
npx prisma generate

# Check database connection
echo "🔍 Teste Datenbankverbindung..."
if npx prisma db push --preview-feature 2>/dev/null; then
    echo "✅ Datenbankverbindung erfolgreich"
else
    echo "❌ Datenbankverbindung fehlgeschlagen"
    echo "Überprüfe deine DATABASE_URL in der .env Datei"
    echo ""
    echo "Für lokale Entwicklung mit Docker:"
    echo "docker run --name neon-postgres \\"
    echo "  -e POSTGRES_DB=neon_murer_cms \\"
    echo "  -e POSTGRES_USER=neon_user \\"
    echo "  -e POSTGRES_PASSWORD=neon_password \\"
    echo "  -p 5432:5432 \\"
    echo "  -d postgres:15"
    echo ""
    echo "DATABASE_URL=\"postgresql://neon_user:neon_password@localhost:5432/neon_murer_cms\""
    exit 1
fi

# Run migrations
echo "🗃️ Führe Datenbank-Migrationen aus..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Lade initiale Daten..."
npm run seed

echo ""
echo "🎉 Setup erfolgreich abgeschlossen!"
echo ""
echo "Nächste Schritte:"
echo "1. Starte den Server:     npm run dev"
echo "2. Öffne das CMS:        http://localhost:3000/cms-admin/"
echo "3. Verwalte Datenbank:   npx prisma studio"
echo ""
echo "Viel Erfolg mit deinem CMS! 🚀" 