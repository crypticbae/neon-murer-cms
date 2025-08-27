# 🚀 Neon Murer CMS - Deployment Übersicht

## 📋 Schnellstart (Für Eilige)

Wenn du das komplette System schnell auf deinem Server deployen möchtest:

### Option 1: One-Click Deployment (Empfohlen)
```bash
# 1. Projekt auf Server kopieren
git clone https://github.com/your-repo/neon-murer-cms.git /opt/neon-murer-cms
cd /opt/neon-murer-cms

# 2. Quick-Deploy-Script ausführen
./scripts/quick-deploy.sh
```

Das war's! Das Script macht alles automatisch:
- ✅ Docker Container bauen und starten
- ✅ PostgreSQL Datenbank einrichten  
- ✅ Sichere Passwörter generieren
- ✅ Admin-User erstellen
- ✅ Health Checks durchführen
- ✅ Backup-System konfigurieren

### Option 2: Manuelle Kontrolle
Folge der detaillierten Anleitung in `SERVER-DEPLOYMENT-GUIDE.md`

---

## 🎯 Nach dem Deployment

### Zugriff auf dein CMS:
- **Website**: `http://your-server-ip:3001/`
- **Admin-Panel**: `http://your-server-ip:3001/cms-admin/`
- **API-Health**: `http://your-server-ip:3001/api/health`

### Standard-Zugangsdaten:
```
E-Mail: admin@neonmurer.ch
Passwort: [wird vom Script generiert und angezeigt]
```

---

## 🛠️ Wichtige Befehle

### Container-Management:
```bash
# Status prüfen
docker-compose -f docker-compose.prod.yml ps

# Logs anzeigen
docker-compose -f docker-compose.prod.yml logs -f app

# Neustart
docker-compose -f docker-compose.prod.yml restart

# Stoppen
docker-compose -f docker-compose.prod.yml down

# Komplett neu starten
docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d
```

### Backup & Wartung:
```bash
# Backup erstellen
./scripts/backup.sh

# Update durchführen
./scripts/update.sh  # (wenn verfügbar)

# Logs bereinigen
docker system prune -f
```

---

## 🔧 Konfiguration anpassen

### Wichtige Dateien:
- **`.env`** - Umgebungsvariablen (Passwörter, Domains, etc.)
- **`docker-compose.prod.yml`** - Docker-Services-Konfiguration
- **`config/redis.conf`** - Redis-Konfiguration
- **`nginx/nginx.conf`** - Nginx-Proxy-Konfiguration (optional)

### Häufige Anpassungen:
```bash
# Domain ändern
nano .env
# Ändere: FRONTEND_URL="https://your-domain.com"

# SSL aktivieren  
# 1. SSL-Zertifikate in nginx/ssl/ kopieren
# 2. docker-compose restart nginx

# E-Mail-Versand konfigurieren
nano .env
# Setze: SMTP_HOST, SMTP_USER, SMTP_PASS
```

---

## 🚨 Troubleshooting

### Container starten nicht:
```bash
# Logs prüfen
docker-compose -f docker-compose.prod.yml logs

# Services einzeln starten
docker-compose -f docker-compose.prod.yml up db
docker-compose -f docker-compose.prod.yml up app
```

### Database-Probleme:
```bash
# Database-Container prüfen
docker-compose -f docker-compose.prod.yml exec db psql -U neon_user -d neon_murer_cms

# Migration neu ausführen
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Performance-Probleme:
```bash
# Resource-Usage prüfen
docker stats

# Container-Limits anpassen in docker-compose.prod.yml
```

---

## 📚 Vollständige Dokumentation

Für detaillierte Informationen siehe:
- **`SERVER-DEPLOYMENT-GUIDE.md`** - Komplette Schritt-für-Schritt-Anleitung
- **`docker-compose.prod.yml`** - Production-Konfiguration  
- **`.env.production.template`** - Alle verfügbaren Umgebungsvariablen

---

## 🆘 Support

Bei Problemen:
1. Prüfe die Logs: `docker-compose -f docker-compose.prod.yml logs app`
2. Teste Health-Check: `curl http://localhost:3001/api/health`
3. Überprüfe Container-Status: `docker-compose -f docker-compose.prod.yml ps`

**Happy Deploying! 🎉**
