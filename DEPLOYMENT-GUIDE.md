# 🚀 Neon Murer CMS - Deployment Guide

## 📋 Übersicht

Diese Anleitung zeigt dir, wie du das Neon Murer CMS auf verschiedenen Hosting-Plattformen bereitstellst.

## 🏗️ Deployment-Optionen

### 1. 🥇 **Railway (Empfohlen - Einfach)**
- ✅ Automatische PostgreSQL-Datenbank
- ✅ Git-basiertes Deployment  
- ✅ Kostenlose Tier verfügbar
- ✅ Einfaches Setup

### 2. 🌊 **Vercel + Neon Database**
- ✅ Serverless Functions
- ✅ Kostenlose Tier
- ✅ Optimiert für Node.js

### 3. 🐙 **Render**
- ✅ Kostenlose PostgreSQL
- ✅ Einfache Konfiguration
- ✅ Automatische HTTPS

### 4. ☁️ **DigitalOcean App Platform**
- ✅ Professionelles Hosting
- ✅ Skalierbar
- ✅ Managed Database

---

## 🚀 Option 1: Railway Deployment (Empfohlen)

### Schritt 1: Vorbereitung

```bash
# 1. Git Repository erstellen (falls noch nicht vorhanden)
git init
git add .
git commit -m "Initial commit"

# 2. Repository zu GitHub/GitLab pushen
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

### Schritt 2: Railway Setup

1. **Account erstellen**: [railway.app](https://railway.app)
2. **GitHub verbinden**: Autorisiere Railway
3. **Neues Projekt**: "Deploy from GitHub repo"
4. **Repository auswählen**: Dein Neon Murer Repository

### Schritt 3: Environment Variables

```env
# Kopiere diese Variablen in Railway
NODE_ENV=production
PORT=3001

# Database (wird automatisch von Railway gesetzt)
DATABASE_URL=${{POSTGRES.DATABASE_URL}}

# Security
JWT_SECRET=DEIN_SICHERER_JWT_SECRET_HIER
BCRYPT_ROUNDS=12

# Optional: Monitoring
SENTRY_DSN=YOUR_SENTRY_DSN

# File Upload
MAX_FILE_SIZE=10mb
UPLOAD_PATH=./content/images

# Analytics
ANALYTICS_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_TO_FILE=false
```

### Schritt 4: Build & Deploy

Railway startet automatisch:
```bash
npm install
npm run generate    # Prisma generate
npm run migrate:deploy
npm run seed        # Optional: Seed data
npm start
```

---

## 🌊 Option 2: Vercel + Neon Database

### Schritt 1: Database Setup (Neon)

1. **Account**: [neon.tech](https://neon.tech)
2. **Neue Datenbank erstellen**
3. **Connection String kopieren**

### Schritt 2: Vercel Setup

```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt konfigurieren
vercel

# Environment Variables setzen
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### Schritt 3: vercel.json erstellen

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Schritt 4: Deploy

```bash
vercel --prod
```

---

## 🐙 Option 3: Render

### Schritt 1: Render Setup

1. **Account**: [render.com](https://render.com)
2. **New Web Service**
3. **GitHub Repository verbinden**

### Schritt 2: Konfiguration

```yaml
# render.yaml
services:
  - type: web
    name: neon-murer-cms
    env: node
    plan: starter  # Kostenlos
    buildCommand: npm install && npm run generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: neon-murer-db
          property: connectionString

databases:
  - name: neon-murer-db
    plan: starter  # Kostenlos
    postgresMajorVersion: 15
```

---

## ☁️ Option 4: DigitalOcean App Platform

### Schritt 1: App Platform Setup

1. **DigitalOcean Account**
2. **App Platform** → **Create App**
3. **GitHub Repository** verbinden

### Schritt 2: .do/app.yaml

```yaml
name: neon-murer-cms
services:
- name: web
  source_dir: /
  github:
    repo: your-username/neon-murer-cms
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${neon-murer-db.DATABASE_URL}

databases:
- name: neon-murer-db
  engine: PG
  version: "15"
  size: basic
```

---

## 🛠️ Deployment-Vorbereitung

### 1. Environment Variables generieren

```bash
# JWT Secret generieren
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Oder verwende diesen Script
npm run env:secrets
```

### 2. Production Build

```bash
# Dependencies installieren
npm ci --production

# Database Setup
npm run generate
npm run migrate:deploy

# Optional: Seed data
npm run seed
```

### 3. Health Check

```bash
# Nach Deployment testen
curl https://your-app.railway.app/api/health
```

---

## 🔒 Production-Sicherheit

### SSL/HTTPS
- ✅ **Railway**: Automatisch
- ✅ **Vercel**: Automatisch  
- ✅ **Render**: Automatisch
- ✅ **DigitalOcean**: Automatisch

### Environment Variables
```env
# Pflicht für Production
JWT_SECRET=sehr_sicherer_64_zeichen_string
NODE_ENV=production
DATABASE_URL=postgresql://...

# Empfohlen
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Database Backups
```bash
# Automatische Backups aktivieren (je nach Provider)
# Railway: Automatisch in Pro Plan
# Render: Automatisch  
# DigitalOcean: Automatisch
```

---

## 📊 Monitoring & Logs

### 1. Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system info

### 2. Logging
```bash
# Production Logs ansehen
# Railway: Dashboard → Logs
# Vercel: Dashboard → Functions → Logs  
# Render: Dashboard → Logs
```

### 3. Error Tracking (Optional)
```env
# Sentry Integration
SENTRY_DSN=https://your-sentry-dsn
```

---

## 🚦 Post-Deployment Checklist

### ✅ Funktionalität testen
- [ ] Website lädt korrekt
- [ ] Admin-CMS erreichbar (`/cms-admin`)
- [ ] Login funktioniert (admin@neonmurer.ch / Standard-Passwort)
- [ ] Passwort ändern in Einstellungen → Sicherheit
- [ ] Media-Upload funktioniert
- [ ] API-Endpunkte antworten

### ✅ Performance prüfen
- [ ] Bilder werden optimiert geladen
- [ ] Lazy Loading funktioniert
- [ ] Analytics tracken

### ✅ Sicherheit
- [ ] HTTPS aktiv
- [ ] Environment Variables gesetzt
- [ ] Standard Admin-Passwort geändert
- [ ] JWT Secret konfiguriert
- [ ] Rate Limiting aktiv

---

## 🆘 Troubleshooting

### Build Fehler
```bash
# Prisma generate fehlschlägt
npm run generate

# Dependencies fehlen
npm ci

# Environment Variables fehlen
npm run env:validate
```

### Database Issues
```bash
# Migration fehlschlägt
npm run migrate:deploy

# Connection Timeout
# → DATABASE_URL prüfen
# → Firewall-Einstellungen
```

### Upload Probleme  
```bash
# Dateiberechtigungen
chmod 755 content/images

# Upload-Verzeichnis erstellen
mkdir -p content/images
```

---

## 🎯 Empfehlung

**Für Einsteiger**: Railway
- Einfachstes Setup
- Automatische Datenbank
- Kostenlose Tier

**Für Profis**: DigitalOcean
- Mehr Kontrolle
- Bessere Performance
- Professionelle Features

---

## 📞 Support

Bei Problemen:
1. Logs prüfen
2. Health-Endpoints testen
3. Environment Variables validieren
4. GitHub Issues erstellen

**Viel Erfolg mit deinem Deployment! 🚀**
