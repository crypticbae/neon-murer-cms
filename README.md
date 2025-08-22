# 🌟 Neon Murer CMS Backend

Ein modernes Content Management System für die Neon Murer Website mit PostgreSQL, Node.js und Express.

## 🚀 Features

- ✅ **Echte Seitenbearbeitung** - Hero-Bereiche und Kundenprojekte
- ✅ **PostgreSQL Datenbank** - Skalierbar für viele Kunden
- ✅ **REST API** - Vollständige CRUD-Operationen
- ✅ **HTML-Generierung** - Automatische Erstellung der Live-Website
- ✅ **Media Management** - Bilder und Dateien verwalten
- ✅ **Benutzer-Verwaltung** - Admin, Editor, Viewer Rollen
- ✅ **Security** - Rate Limiting, Helmet, Input Validation

## 📋 Voraussetzungen

- **Node.js** (v18 oder höher)
- **PostgreSQL** (v12 oder höher)
- **npm** oder **yarn**

## 🛠️ Installation

### 1. Repository klonen
```bash
cd /dein/neon-projekt/verzeichnis
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. PostgreSQL Datenbank einrichten

#### Option A: Lokale PostgreSQL Installation
```bash
# macOS mit Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: Download von https://www.postgresql.org/download/
```

#### Option B: Docker (Empfohlen für Entwicklung)
```bash
# PostgreSQL in Docker starten
docker run --name neon-postgres \
  -e POSTGRES_DB=neon_murer_cms \
  -e POSTGRES_USER=neon_user \
  -e POSTGRES_PASSWORD=neon_password \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud-Lösung (Empfohlen für Produktion)
- **Supabase** (gratis tier): https://supabase.com
- **Railway**: https://railway.app
- **AWS RDS** oder **Google Cloud SQL**

### 4. Umgebungsvariablen konfigurieren
```bash
# .env.example nach .env kopieren
cp .env.example .env

# .env Datei bearbeiten
nano .env
```

**Wichtige Einstellungen in .env:**
```env
# Datenbank - anpassen an deine Installation
DATABASE_URL="postgresql://neon_user:neon_password@localhost:5432/neon_murer_cms"

# Starker JWT Secret generieren
JWT_SECRET="dein-super-sicherer-jwt-key-hier"

# Admin-Benutzer
ADMIN_EMAIL=admin@neonmurer.ch
ADMIN_PASSWORD=dein-sicheres-passwort
```

### 5. Datenbank-Schema erstellen
```bash
# Prisma Client generieren
npx prisma generate

# Datenbank migrationen ausführen
npx prisma migrate dev

# Initiale Daten laden (optional)
npm run seed
```

### 6. Server starten
```bash
# Entwicklungsmodus (mit Auto-Reload)
npm run dev

# Produktionsmodus
npm start
```

## 📖 API-Endpunkte

### Pages (Seiten)
- `GET /api/pages` - Alle Seiten abrufen
- `GET /api/pages/:id` - Einzelne Seite abrufen
- `PUT /api/pages/:id` - Seite aktualisieren
- `POST /api/pages/:id/generate` - HTML-Datei generieren

### Media (Medien)
- `GET /api/media` - Alle Medien abrufen
- `POST /api/media/upload` - Datei hochladen
- `DELETE /api/media/:id` - Datei löschen

### Customers (Kunden)
- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunden erstellen
- `PUT /api/customers/:id` - Kunde aktualisieren

## 🔧 Verwendung

### 1. CMS-Admin öffnen
```
http://localhost:3000/cms-admin/
```

### 2. Seite bearbeiten
1. Gehe zu "Inhalte verwalten"
2. Wähle eine Service-Seite (z.B. Leuchtschriften)
3. Klicke "Bearbeiten"
4. Ändere Hero-Texte oder Kundenprojekte
5. Klicke "Speichern"

### 3. Live-Website überprüfen
Die HTML-Dateien werden automatisch aktualisiert:
- `lichtwerbung/leuchtschriften.html`
- `beschriftungen/fahrzeugbeschriftung.html`
- etc.

## 🗃️ Datenbank-Schema

```mermaid
erDiagram
    User ||--o{ Page : creates
    Page ||--o| HeroSection : has
    Page ||--o| ProjectsSection : has
    ProjectsSection ||--o{ Project : contains
    
    User {
        string id
        string email
        string password
        string name
        enum role
    }
    
    Page {
        string id
        string title
        string path
        string category
        enum type
        enum status
    }
    
    HeroSection {
        string title
        string subtitle
        string description
        string backgroundColor
        string backgroundImage
    }
    
    Project {
        string name
        string imageUrl
        int order
    }
```

## 🔒 Sicherheit

- **Rate Limiting** - 100 Requests pro 15 Minuten
- **Input Validation** - Alle Eingaben werden validiert
- **Helmet** - Security Headers
- **CORS** - Cross-Origin Resource Sharing konfiguriert
- **bcrypt** - Passwort-Hashing
- **JWT** - Sichere Authentifizierung

## 📊 Monitoring

### Datenbank verwalten
```bash
# Prisma Studio öffnen (GUI für Datenbank)
npx prisma studio
```

### Logs überwachen
```bash
# Server-Logs anzeigen
npm run dev

# Datenbank-Logs (bei lokaler Installation)
tail -f /usr/local/var/log/postgres.log
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## 🚀 Deployment (Produktion)

### 1. Cloud-Datenbank einrichten
- **Supabase**: Kostenlos bis 500MB
- **Railway**: Einfaches Deployment
- **AWS RDS**: Enterprise-grade

### 2. Environment Variables setzen
```env
NODE_ENV=production
DATABASE_URL="deine-production-database-url"
JWT_SECRET="super-sicherer-production-key"
```

### 3. Server deployen
```bash
# Build für Produktion
npm run build

# Server starten
npm start
```

## 🛟 Troubleshooting

### Häufige Probleme

**❌ "Database connection failed"**
```bash
# PostgreSQL Status prüfen
brew services list | grep postgres  # macOS
sudo systemctl status postgresql    # Linux

# Verbindung testen
psql -h localhost -U neon_user -d neon_murer_cms
```

**❌ "Port 3001 already in use"**
```bash
# Port ändern in .env
PORT=3002

# Oder laufende Prozesse beenden
lsof -ti:3001 | xargs kill -9
```

**❌ "Prisma Client nicht gefunden"**
```bash
npx prisma generate
```

**❌ "Backend nicht erreichbar"**
- Überprüfe ob Server läuft: `npm run dev`
- Überprüfe URL in Frontend: `/api/pages`
- Öffne Browser-Konsole für Fehlermeldungen

## 📞 Support

- **Bug Reports**: Erstelle ein GitHub Issue
- **Feature Requests**: Diskussion im Team
- **Dokuméntation**: Siehe `/docs` Ordner

## 📈 Nächste Schritte

1. **Media Management** vollständig implementieren
2. **Benutzer-Authentifizierung** hinzufügen
3. **Backup-System** für die Datenbank
4. **CI/CD Pipeline** für automatisches Deployment
5. **Performance Monitoring** mit Tools wie New Relic

---

**Made with ❤️ für Neon Murer AG** 